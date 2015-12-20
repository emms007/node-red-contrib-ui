module.exports = function(RED) {
    var ui = require('../ui')(RED);

	
	
    function SwitchNodeRow(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

		this.on('input', function(msg) {
            ui.emit('show-toast', {
                title: msg.topic,
                message: msg.payload
            });
        });
		
		
        var done = ui.add({
			emitOnlyNewValues: false,
			skipForwardingToOutputNode: true,
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'switch-row',
                label: config.name,
                order: config.order,
                value: false,
				buttons: config.buttons,
				buttonsconfig: config.buttons
            }, 
			   beforeEmit: function(msg, value) {
                
				// Msg received, extra data and update button color
				var newButtColor = {};
				// Browse thru all knowns button in config
				for (var i=0;i<config.buttons.length;i++) {
					//init with config color
					newButtColor[i]={oncolor:config.buttons[i].oncolor};
					newButtColor[i].change=false;
					// rewrite if current butt must be changed
					if (config.buttons[i].topic==msg.topic) {
						newButtColor[i].oncolor=value?config.buttons[i].oncolor:'';
						newButtColor[i].change=true;
					}
				}
								
                return { SwitchRowChangedData: newButtColor };
            },
            convert: function (payload, oldValues, msg) {
				//Convert from String input (payload) to boolean state of button
						
				switch (payload.toString()) {
                    case config.onvalue:  return true; 
                    case config.offvalue: return false; 
                }
			
				
				return payload;
            }, 
            convertBack: function (value) {
				// Upon sending back ata from UI to next nodes, convert back to the the boolean data format
				value.value=value.value?config.onvalue:config.offvalue;
				return value;
            },
            beforeSend: function (msg,original) {
				// Wrap up the msg to next nodes
                msg.topic = msg.payload.topic;
				msg.payload = msg.payload.value;
				return msg;
            }
        })
;

        node.on("close", done);
    }

    RED.nodes.registerType("ui_switch_row", SwitchNodeRow);
};