// API key for SongTrax
const APIKEY = "DMqxGegz9a";

// Base URL for SongTrax API
const baseURL = "https://comp2140.uqcloud.net/api/";

/**
 * Function to get all samples
 * @returns {Promise<Object>} A promise that resolves to an array of samples.
 */
async function getSamples() {
  const url = `${baseURL}sample/?api_key=${APIKEY}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

/**
 * Function to get a specific sample by ID
 * @param {number} id - The ID of the sample to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the retrieved sample object.
 */
async function getSample(id) {
  const url = `${baseURL}sample/${id}/?api_key=${APIKEY}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

/**
 * Function to create a new sample
 * @param {string} type - The type of the sample.
 * @param {string} name - The name of the sample.
 * @param {Object} recordingData - The recording data for the sample.
 * @returns {Promise<Object>} A promise that resolves to the created sample object.
 */
async function createSample(type, name, recordingData) {
  const url = `${baseURL}sample/?api_key=${APIKEY}`;
  const date = new Date(); // Get the current date and time
  const data = {
    type,
    name,
    recording_data: JSON.stringify(recordingData),
    date_created: date.toISOString(), // Convert the date to an ISO string
    api_key: APIKEY,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  return json;
}

/**
 * Function to update an existing sample by ID
 * @param {number} id - The ID of the sample to update.
 * @param {string} type - The updated type of the sample.
 * @param {string} name - The updated name of the sample.
 * @param {Object} recordingData - The updated recording data for the sample.
 * @returns {Promise<Object>} A promise that resolves to the updated sample object.
 */
async function updateSample(id, type, name, recordingData) {
  const url = `${baseURL}sample/${id}/?api_key=${APIKEY}`;
  const date = new Date(); // Get the current date and time
  const data = {
    id,
    type,
    name,
    recording_data: JSON.stringify(recordingData),
    date_created: date.toISOString(), // Convert the date to an ISO string
    api_key: APIKEY,
  };

  const response = await fetch(url, {
    method: "PUT", // Use the PUT method to update the sample
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  return json;
}

/**
 * Function to get all locations
 * @returns {Promise<Object>} A promise that resolves to an array of locations.
 */
async function getLocations() {
  const url = `${baseURL}location/?api_key=${APIKEY}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

/**
 * Function to share a sample with a location
 * @param {number} sampleId - The ID of the sample to share.
 * @param {number} locationId - The ID of the location to share with.
 * @returns {Promise<Object>} A promise that resolves to the shared sample object.
 */
async function SampleToLocation(sampleId, locationId) {
  const url = `${baseURL}sampletolocation/?api_key=${APIKEY}`;
  const date = new Date().toISOString();
  const data = {
    api_key: APIKEY,
    sample_id: sampleId,
    location_id: locationId,
    datetime: date,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  return json;
}

/**
 * Function to update the sample's sharing status with a location
 * @param {number} sampleId - The ID of the sample to update.
 * @param {number} locationId - The ID of the location to update.
 * @param {string} locationName - The name of the location.
 * @param {boolean} sharingStatus - The sharing status (true or false).
 * @returns {Promise<Object>} A promise that resolves to the updated location object.
 */
async function UpdateSampleToLocation(
  sampleId,
  locationId,
  locationName,
  sharingStatus
) {
  const url = `${baseURL}location/${locationId}/?api_key=${APIKEY}`;
  const data = {
    api_key: APIKEY,
    sample_id: sampleId,
    name: locationName,
    sharing: sharingStatus, // Set sharing status to false to unshare
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  return json;
}

export {
  getSamples,
  getSample,
  createSample,
  updateSample,
  getLocations,
  SampleToLocation,
  UpdateSampleToLocation,
};
