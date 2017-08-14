var wit = require('node-wit');

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var middleware = {};
    var intentsArr = [];
    middleware.receive = function(bot, message, next) {
        if (message.text) {
            wit.captureTextIntent(config.token, message.text, function(err, res) {
                if (err) {
                    next(err);
                } else {
                    // sort in descending order of confidence so the most likely match is first.
                    // console.log(JSON.stringify(res));
                    message.intentsObj = res.outcomes[0].entities;
                    // console.log(message.intents);

                    for (key in message.intentsObj) {
                      message.intentsObj[key].map(function (item) {
                        item.name = key;
                        intentsArr.push(item);
                      });
                    }
                    message.intents = intentsArr;
                    next();
                }
            });
        }

    };

    middleware.hears = function(tests, message) {

        if (message.intents) {
            for (var i = 0; i < message.intents.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                  // message.intents.forEach(function (intent) {
                  //   console.log(intent);
                  // });
                  console.log(message.intents[i].value,message.intents[i].confidence)
                  console.log(tests[t],config.minimum_confidence)
                    if (message.intents[i].value == tests[t] || message.intents[i].name == tests[t] &&
                        message.intents[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }
        return false;
    };


    return middleware;

};
