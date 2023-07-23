const algoliasearch = require('algoliasearch');
const dotenv = require('dotenv');
const logger = require('../config/logger');
const Bugsnag = require('@bugsnag/js');

dotenv.config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;

// Start the API client
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

// Create an index (or connect to it, if an index with the name `ALGOLIA_INDEX_NAME` already exists)
const index = client.initIndex(ALGOLIA_INDEX_NAME);

const createIndex = async (body) => {
  const updatedBody = {
    id: body.id,
    tags: body.tags,
    metadata: body.metadata,
    is_published: body.is_published,
    is_deleted: body.is_deleted,
    is_private: body.is_private,
    url: body.url,
    thumbnail: body.thumbnail,
    description: body.description,
    title: body.title,
    year: body.year,
    month: body.month,
    meeting: body.meeting,
    people: body.people,
    location: body.location,
    user: body.user,
    createdAt: body.createdAt,
    updatedAt: body.updatedAt,
    objectID: body.id,
  };

  //append objectID to the body before anything

  try {
    await index.saveObject(updatedBody);
    logger.info('Index created!');
  } catch (error) {
    logger.error(error);
  }
};

//this function is just a dummy function to see if index was initialized
const startSearchEngine = async () => {
  const server = index;
  if (server) {
    logger.info('Search engine started');
  } else {
    logger.error('Search engine failed to start');
  }
};

const searchIndex = async (query, options) => {
  const filters = 'is_private:false AND is_deleted: false AND is_published: true ';
  try {
    await index.setSettings({
      searchableAttributes: ['title', 'tags', 'meeting', 'location', 'people', 'description', 'year', 'month'],
      attributesForFaceting: ['is_private', 'is_deleted', 'is_published'],
    });
    const search = await index.search(query, {
      filters,
      page: options.skip ? options.skip : 0,
      hitsPerPage: options.limit ? options.limit : 3,
    });
    return search;
  } catch (error) {
    logger.error(error);
    Bugsnag.notify(err);
  }
};

const updateSearchIndex = async (id, photo) => {
  try {
    //attach objectID to photo object
    photo.objectID = id;

    await index.partialUpdateObject(photo);

    logger.info('Updated search index successfully!');
  } catch (err) {
    logger.error(err);
    Bugsnag.notify(err);
  }
};

module.exports = {
  createIndex,
  searchIndex,
  startSearchEngine,
  updateSearchIndex,
};
