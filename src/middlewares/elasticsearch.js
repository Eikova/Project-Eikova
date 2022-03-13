const { Client } = require('@elastic/elasticsearch');
const logger = require('../config/logger');
const photoService = require('../services/photos.service');

const host = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';
const index = process.env.ELASTICSEARCH_INDEX || 'eikova';
const client = new Client({ node: host });

const startSearchEngine = async () => {
  try {
    await client.ping({
      requestTimeout: 3000,
    });
    logger.info('Connected to Elasticsearch');
  } catch (error) {
    logger.error(`Elasticsearch error: ${error}`);
  }
};

const createIndex = async () => {
  const body = {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0,
    },
    mappings: {
      _doc: {
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
    },
  };
  try {
    await client.indices.create({ index, body });
    logger.info(`Index ${index} created`);
  } catch (err) {
    if (err.status === 400) {
      logger.info('index already exists');
    } else {
      logger.error(err);
    }
  }
};

const populateIndex = async () => {
  try {
    const photos = await photoService.getPhotos();
    await client.bulk({
      index,
      body: photos,
    });
    logger.info('Index populated');
  } catch (err) {
    logger.error(err);
  }
};

const deleteIndex = async () => {
  try {
    await client.indices.delete({ index });
    logger.info(`Index ${index} deleted`);
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
    logger.info('Added to search index successfully');
  } catch (err) {
    logger.error(err);
  }
};

const updateSearchIndex = async (photo) => {
  try {
    await client.update({
      index,
      id: photo.id,
      body: {
        doc: photo,
      },
    });
    logger.info('Updated search index successfully');
  } catch (err) {
    logger.error(err);
  }
};

const deleteFromSearchIndex = async (photo) => {
  try {
    await client.delete({
      index,
      id: photo.id,
    });
    logger.info('Deleted from search index successfully');
  } catch (err) {
    logger.error(err);
  }
};

const getFromSearchIndex = async (id) => {
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

module.exports = {
  createIndex,
  startSearchEngine,
  populateIndex,
  deleteIndex,
  addToSearchIndex,
  updateSearchIndex,
  deleteFromSearchIndex,
  getFromSearchIndex,
};
