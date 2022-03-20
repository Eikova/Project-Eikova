const { Client } = require('@elastic/elasticsearch');
const logger = require('../config/logger');
const photoService = require('../services/photos.service');

const host = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';
const index = process.env.ELASTICSEARCH_INDEX || 'eikova';
const client = new Client({ node: host });

const populateIndex = async () => {
  try {
    const photos = await photoService.getPhotos();
    await client.bulk({
      index,
      body: photos,
    });
    logger.info(`Index (${index}) populated!`);
  } catch (err) {
    logger.error(err);
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
        meeting_id: { type: 'text' },
        user: { type: 'text' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  };
  try {
    await client.indices.create({ index, body });
    logger.info(`Index ${index} created`);
    await populateIndex();
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
};
