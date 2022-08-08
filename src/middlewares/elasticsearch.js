const { Client } = require('@elastic/elasticsearch');
const Bugsnag = require('@bugsnag/js');
const logger = require('../config/logger');
// const photoService = require('../services/photos.service');
const { photoService } = require('../services');

const host = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';
const index = process.env.ELASTICSEARCH_INDEX || 'eikova';
const client = new Client({ node: host });

const populateIndex = async () => {
  try {
    const photos = await photoService.adminGetPhotos();
    await client.bulk({
      index,
      body: photos,
    });
    logger.info(`Index (${index}) populated!`);
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};


const createIndex = async () => {
  const body = {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        url: { type: 'text' },
        thumbnail: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'text' },
        tags: { type: 'text' },
        metadata: { type: 'object' },
        is_published: { type: 'boolean' },
        is_private: { type: 'boolean' },
        is_deleted: { type: 'boolean' },
        downloads: { type: 'long' },
        year: { type: 'text' },
        month: { type: 'text' },
        meeting: { type: 'text' },
        people: { type: 'text' },
        user: { type: 'text' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  };
  try {
    await client.indices.create({ index, body });
    // await client.indices.create({ index });
    logger.info(`Index ${index} created`);
    // await populateIndex();
  } catch (err) {
    if (err.statusCode === 400) {
      logger.info(`index (${index}) already exists!`);
    } else {
      logger.error(err);
    }
  }
};

const startSearchEngine = async () => {
  const server = await client.ping();
  if (server) {
    logger.info('Search engine started');
    await createIndex();
  } else {
    logger.error('Search engine failed to start');
  }
};

const deleteIndex = async () => {
  try {
    await client.indices.delete({ index });
    logger.info(`Index ${index} deleted!`);
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const addToSearchIndex = async (photo) => {
  try {
    await client.index({
      index,
      body: photo,
    });
    logger.info('Added to search index successfully!');
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const updateSearchIndex = async (id, photo) => {
  try {
    await client.update({
      index,
      id,
      body: {
        doc: photo,
      },
    });
    logger.info('Updated search index successfully!');
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const getFromIndexById = async (id) => {
  try {
    const { body } = await client.get({
      index,
      id,
    });
    return body;
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const getFromIndexByPhotoId = async (photoId) => {
  try {
    const { body } = await client.search({
      index,
      body: {
        query: {
          match: {
            id: photoId,
          },
        },
      },
    });
    return body;
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const deleteFromSearchIndex = async (id) => {
  try {
    const doc = await getFromIndexByPhotoId(id);
    await client.delete({
      index,
      id: doc._id,
    });
    logger.info('Deleted from search index successfully!');
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const searchIndex = async (phrase, options) => {
  try {
    return await client.search({
      from: options.skip ? options.skip : 0,
      size: options.limit ? options.limit : 10,
      index,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  is_private: false,
                },
              },
              {
                term: {
                  is_deleted: false,
                },
              },
              {
                term: {
                  is_published: true,
                },
              },
              {
                multi_match: {
                  query: phrase,
                  type: 'cross_fields',
                  fields: ['title', 'description', 'tags', 'year', 'month', 'meeting', 'people'],
                },
              },
            ],
            // minimum_should_match: 2,
          },
        },
        // sort: [{ createdAt: { order: options.sortBy } }],
      },
    });
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

const adminPopulateIndex = async (photos) => {
  try {
    await client.bulk({
      index,
      body: photos,
    });
    logger.info(`Index (${index}) populated!`);
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

module.exports = {
  createIndex,
  startSearchEngine,
  populateIndex,
  deleteIndex,
  addToSearchIndex,
  updateSearchIndex,
  deleteFromSearchIndex,
  getFromIndexById,
  getFromIndexByPhotoId,
  searchIndex,
  adminPopulateIndex,
};
