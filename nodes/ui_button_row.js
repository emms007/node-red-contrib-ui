module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function ButtonRowNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;
        
        var done = ui.add({
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'button-row',
                order: config.order,
                value: node.id,
                buttons: config.buttons
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            }
        });
        
        node.on("close", done);
    }

    RED.nodes.registerType("ui_button_row", ButtonRowNode);
};