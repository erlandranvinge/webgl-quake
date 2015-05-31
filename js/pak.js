var utils = require('utils');

var Pak = function(url) {

    var data = utils.readDataFromUrl(url);
    console.log(data);
};

module.exports = exports = Pak;