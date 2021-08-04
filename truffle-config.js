module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!


    compilers: {
        solc: {
            version: "0.4.22",
        }
    },


    networks: {
        development: {
            host: "127.0.0.1",
            port: "7545",
            network_id: "*" // match any network id
        }
    }

};
