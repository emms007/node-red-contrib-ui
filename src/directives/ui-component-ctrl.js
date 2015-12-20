/* global angular */
/* global d3 */
angular.module('ui').controller('uiComponentController', ['UiEvents', '$interpolate', '$interval',
    function (events, $interpolate, $interval) {
        var me = this;
        if (typeof me.item.format === "string")
            me.item.getText = $interpolate(me.item.format).bind(null, me.item);
        
        me.init = function() {
            switch (me.item.type) {
                case 'button': break;
				
                case 'button-row':
                    me.buttonClick = function (payload) {
                        if (payload) me.item.value = payload;
                        me.valueChanged(0);
                    }
                    break;
					
				case 'switch-row':
                    me.buttonClick = function (topic) {
						
						if (topic) {
							for (var i=0;i<me.item.buttons.length;i++) { // Lets go thru all buttons
							
							if (me.item.buttons[i].topic==topic) { // Switch currently push button to other boolean state - set the related topic/new val to its .value state so we may use it to wrap up the outgoing message
								me.item.buttons[i].oncolor=me.item.buttons[i].oncolor.length==0 ? me.item.buttonsconfig[i].oncolor : '';
								me.item.value={topic:topic, value:(me.item.buttons[i].oncolor.length==0?false:true)};
							}	
							}
						}
						
						// Publish changes
						me.valueChanged(0);
						
                    }
                    break;
					
                    
                case 'numeric':
                    var changeValue = function(delta) {
                        if (delta > 0) {
                            if (me.item.value < me.item.max) {
                                me.item.value = Math.min(me.item.value + delta, me.item.max);
                            }
                        } else if (delta < 0) {
                            if (me.item.value > me.item.min) {
                                me.item.value = Math.max(me.item.value + delta, me.item.min);
                            }
                        }
                    };
                    
                    var range = me.item.max - me.item.min;
                    var promise;
                    me.periodicChange = function(delta) {
                        changeValue(delta);
                        var i=0;
                        promise = $interval(function() {
                            i++;
                            if (i>35) changeValue(Math.sign(delta) * Math.floor(range / 10));
                            else if (i>25) changeValue(delta*2);
                            else if (i>15) changeValue(delta);
                            else if (i>5 && i%2) changeValue(delta);
                        }, 100);
                    };
                    me.stopPeriodic = function() {
                        $interval.cancel(promise);
                        me.valueChanged(0);
                    };
                    break;
                    
                case 'chart':
                    if (!me.item.value) me.item.value = [];
                
                    me.formatTime = function(d) {  
                        return d3.time.format('%H:%M:%S')(new Date(d));  
                    };
            }
        }
    
        me.valueChanged = function(throttleTime) {
            throttle({
                id: me.item.id,
                value: me.item.value
            }, typeof throttleTime === "number" ? throttleTime : 10);
        };
        
        var timer;
        var throttle = function(data, timeout) {
            if (timeout === 0) {
                events.emit(data);
                return;
            }
            
            if (timer) clearTimeout(timer);
            timer = setTimeout(function() {
                timer = undefined;
                events.emit(data);
            }, timeout);
        };
    }]);
