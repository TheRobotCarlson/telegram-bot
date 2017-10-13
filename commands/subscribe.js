var Command = require('./command.js').command;
const Datastore = require('@google-cloud/datastore');
const datastoreConfig = require('../config.js').datastoreConfig;
var datastoreClient = Datastore(datastoreConfig);

var options = {
    reply_markup: {
        inline_keyboard: [
            [{
                text: 'Subscribe',
                callback_data: 'SUB'
            }],
            [{
                text: 'Unsubscribe',
                callback_data: 'USUB'
            }]
        ]
      }
    };

var subscribe = new Command('Bot', "Manage your subscription to updates and notifications", function(){
    this.options = options;
    return "Manage your subscription:"
});



subscribe.sub = function (chatId) {
    return new Promise((resolve, reject) => {
  
      console.time('[LOG] Added new subscription...[' + chatId + ']');
  
      const kind = 'Subscription';
      // The Cloud Datastore key for the new entity
      const subscriptionKey = datastoreClient.key([kind,datastoreClient.int(chatId)]);
  
      const subscription = {
        key: subscriptionKey,
        data: {
          interface: 'telegram',
          settings: {
              stage: process.env.STAGE
          }
        }
      };

      // Saves the entity
      datastoreClient.save(subscription)
        .then(() => {
          resolve(chatId);
        })
        .catch((err) => {
          console.error('ERROR:', err);
          reject('Rejected');
        });
  
        console.timeEnd('[LOG] Added new subscription...[' + chatId + ']');
    });
  }

subscribe.usub = function(chatId){
    return new Promise((resolve, reject) => {
        console.time('[LOG] Deleted subscription...[' + chatId + ']');

        const kind = 'Subscription';
        const subscriptionKey = datastoreClient.key([kind,datastoreClient.int(chatId)]);

        datastoreClient.delete(subscriptionKey)
        .then(() => {
          resolve(chatId);
        })
        .catch((err) => {
          console.error('ERROR:', err);
          reject('Rejected');
        });

        console.timeEnd('[LOG] Deleted subscription...[' + chatId + ']');

    });
}  

subscribe.callback = function(data,chat_id){
    return new Promise((resolve, reject) => {
        if(data !== undefined)
        {
            if(data === 'USUB'){
                this.usub(chat_id);
            }
            else{
                this.sub(chat_id);
            }
        }

        resolve('OK');
    })
}  

subscribe.callback_message = function(){
    return "Subscription modified."
}


subscribe.behaviour = function(){
    return new Promise((resolve, reject) => {
        resolve('OK');
    })
};  

exports.subscribe = subscribe;
