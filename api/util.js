/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 Util.js

 Is a utility set for all the necessary actions like http calls , encryption and cache mgmt
 
 */

const NodeCache = require("node-cache");
const myCache = new NodeCache();
const { Issuer } = require("openid-client");

/**
 * Mandatory variables for login and OSDU API Call
 */
const CALLBACK_URL = process.env.PG_OSDU_AUTH_REDIRECT_URL;
const AUTH_DISCOVERY_URL = process.env.PG_OSDU_AUTH_DISCOVERY_URL;
const AUTH_CLIENT_ID = process.env.PG_OSDU_CLIENT_ID;
const AUTH_CLIENT_SECRET = process.env.PG_OSDU_SECRET;


/**
 * This class helps us in getting the right OSDU Http client
 * based on the Target Platform
 */
class AuthClientFactory {
    constructor(
      authDiscoveryUrl = AUTH_DISCOVERY_URL,
      authClientId = AUTH_CLIENT_ID,
      authClientSecret = AUTH_CLIENT_SECRET
    ) {
      this.authDiscoveryUrl = authDiscoveryUrl;
      this.authClientId = authClientId;
      this.authClientSecret = authClientSecret;
      this.client = null;
    }
  
    /***
     * returns Client promise with discovered routes
     * @returns {Promise<Client>}
     */
    async getClient() {
      if (this.client !== null) {
        return this.client;
      }
  
      const issuer = await Issuer.discover(this.authDiscoveryUrl);
  
      if (process.env.PG_OSDU_TARGET_PLATFORM.toLowerCase() == "gcp") {
        const googleIssuer = new Issuer({
          issuer: issuer.issuer,
          authorization_endpoint:
            issuer.authorization_endpoint +
            "?access_type=offline&&prompt=consent",
          token_endpoint: issuer.token_endpoint,
          userinfo_endpoint: issuer.userinfo_endpoint,
          jwks_uri: issuer.jwks_uri,
        });
  
        this.client = new googleIssuer.Client({
          client_id: this.authClientId,
          client_secret: this.authClientSecret,
          userinfo_endpoint: issuer.userinfo_endpoint,
          redirect_uris: [CALLBACK_URL],
          response_types: ["code"],
        });
      } else {
        this.client = new issuer.Client({
          issuer: issuer.issuer,
          //authorization_endpoint: issuer.authorization_endpoint+'?access_type=offline&&prompt=consent',
          client_id: this.authClientId,
          client_secret: this.authClientSecret,
          redirect_uris: [CALLBACK_URL],
          userinfo_endpoint: issuer.userinfo_endpoint,
          response_types: ["code"],
        });
      }
      return this.client;
    }
  }
  
module.exports = {
  EncryptDecrypt: (input) => {
    var key = ["P", "a", "R", "@", "d", "1", "G", "m"];
    var output = [];

    for (var i = 0; i < input.length; i++) {
      var charCode = input.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
      output.push(String.fromCharCode(charCode));
    }
    return output.join("");
  },
  SetCache: async (key, value, duration) => {
    try {
      myCache.set(key, value, duration);
    } catch (e) {
      throw e;
    }
  },
  DeleteCache: async (key) => {
    try {
      const value = myCache.del(key);
      if (value == undefined) {
        return null;
      } else {
        return value;
      }
    } catch (e) {
      throw e;
    }
  },
  GetCache: async (key) => {
    try {
      const value = myCache.get(key);
      if (value == undefined) {
        return null;
      } else {
        return value;
      }
    } catch (e) {
      throw e;
    }
  },

  CALLBACK_URL: CALLBACK_URL,
  clientFactory: new AuthClientFactory(),
};

