var
    _ = require('lodash'),
    fs = require('fs'),
    jsonfile = require('jsonfile'),
    Q = require("q"),
    data = {},
    config = {
        localization_path: './i18n/',
        output_path: './output/'
    };

function init () {
    readDir(config.localization_path)
    .then(function () {
        _.forOwn(data, function (value, key) {
            writeFile(key, value);
        });

    });
}

function writeFile (path, obj) {
    var text = '',
        defaultLanguageValue = '',
        objSize = _.size(obj),
        index = 0;


    _.forOwn(obj, function (value, key) {

        if (key === 'en'){
            defaultLanguageValue = value;
        }

        if (index === 0){
            text = text + "{% if ${language} == '"+key+"' %}\n"+value+"\n";
        }else {
            text = text + "{% elsif ${language} == '"+key+"' %}\n"+value+"\n";
        }

        if (index === (objSize-1)) {
            text = text + "{% else %}\n"+defaultLanguageValue+"\n{% endif %}";
        }

        index++;
    });


    fs.writeFile(config.output_path+path+'.txt', text, function (err) {
        if (err) return console.log(err);
    });

}

function readDir (dirname) {
    var deferred = Q.defer();

    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            throw err;
            return;
        }
        readFiles(filenames, deferred);
    });

    return deferred.promise;
}

function readFiles(filenames, deferred) {
    var
        dataObj,
        languageCode = '';

    filenames.forEach(function(filename) {
        dataObj = JSON.parse(fs.readFileSync(config.localization_path + filename, 'utf8'));
        languageCode = _.replace(filename, '.json', '');
        _.forOwn(dataObj, function (value, key) {
            data[key] = _.merge(data[key], {
                [languageCode]: value
            });
        });
    });

    deferred.resolve();
}

init();