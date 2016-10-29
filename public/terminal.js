/*                 _       _           
                 | |     | |          
  _ __   ___   __| |_   _| |_   _ ___ 
 | '_ \ / _ \ / _` | | | | | | | / __|
 | | | | (_) | (_| | |_| | | |_| \__ \
 |_| |_|\___/ \__,_|\__,_|_|\__,_|___/
 @nodulus open source | ©Roi ben haim  ®2016    
 */




angular.module('nodulus').controller("terminalController",
    function ($scope, $Alerts, $IDE, $translate, $resource, $Language, hotkeys) {




        // hotkeys.bindTo($scope)
        //.add({
        //    combo: 'enter',
        //    description: 'save document',
        //    callback: $scope.SendCommand
        //});


    });


angular.module('nodulus').
    directive('terminal', function ($parse, $resource, $timeout) {
        return {
            restrict: 'A', // only activate on element attribute
            // require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs) {
                scope.active_terminal = null;
                scope.active_terminals = {};

                scope.lines = [];
                scope.PaneHeight = $(window).height() - 100;

                scope.terminals = [];

                scope.init_terminal = function (data) {

                    var terminal_id = data || guid();
                    socket.emit('terminal.init', terminal_id);


                    //scope.active_terminal = { id: terminal_id };

                }
                var textbox = element.find("textarea");
                var console = element.find("div.terminal");
                //// Specify how UI should be updated
                //ngModel.$render = function () {
                //    element.html(ngModel.$viewValue || '');
                //};
                scope.cls = function () {
                    scope.active_terminals[scope.active_terminal.id].lines = [];
                }
                scope.close = function () {                    
                    socket.emit('terminal.delete', scope.active_terminal.id);
                    socket.emit('terminal.list');                     
                }


                scope.historyIndex = 0;
                scope.history = function (direction) {                    
                    var historyArray = scope.active_terminals[scope.active_terminal.id].history.map(function (item) {
                        return item;
                    });
                    scope.historyIndex = scope.historyIndex + direction;
                    if (scope.historyIndex > -1 && historyArray.length > scope.historyIndex) {
                        textbox.innerHTML = historyArray[scope.historyIndex];
                        scope.commandLine = historyArray[scope.historyIndex];
                    }
                    else {
                        if (scope.historyIndex > 0) {
                            scope.historyIndex = historyArray.length - 1;
                        }
                        else {
                            scope.historyIndex = 0;
                        }
                        textbox.innerHTML = historyArray[scope.historyIndex];
                        scope.commandLine = historyArray[scope.historyIndex];
                    }
                }
                scope.sendLine = function (line) {
                    var textbox = element.find("#terminalLine")[0];                
                    if (!scope.active_terminals[scope.active_terminal.id].history)
                        scope.active_terminals[scope.active_terminal.id].history = [];
                    if (line) {
                        socket.emit('terminal.command', { 'id': scope.active_terminal.id, 'command': line });
                    } else {
                        scope.active_terminals[scope.active_terminal.id].history.push(textbox.innerHTML);
                        scope.historyIndex = scope.active_terminals[scope.active_terminal.id].history.length;
                        socket.emit('terminal.command', { 'id': scope.active_terminal.id, 'command': textbox.innerHTML });
                    }
                    textbox.innerHTML = "";
                    scope.commandLine = "";                 
                }
                socket.on('terminal.result', function (data) {
                    scope.$apply(function () {
                        var lines = data.stdout.split('\r\n');
                        lines = lines.filter(function (item) {
                            return item !== '';
                        });

                        if (lines.length > 1) {
                            lines.map(function (item, index) {
                                lines[index] = item + '</br>';
                            });
                        }

                        scope.active_terminals[data.id].lines.push({ 'text': lines, 'command': scope.commandLine });
                        $timeout(function () {
                            console[0].scrollTop = console[0].scrollHeight;
                        }, 100);
                        scope.commandLine = '';

                        document.getElementById("terminalLine").focus();
                    });
                });
                socket.on('terminal.list', function (data) {
                    scope.$apply(function () {
                        scope.terminals = data.terminals;
                    });
                });
                socket.on('terminal.init', function (data) {
                    scope.$apply(function () {
                        if (!scope.active_terminals[data.id]) {
                            scope.active_terminals[data.id] = { id: data.id, lines: [] };
                            socket.emit('terminal.list');
                        }
                        scope.active_terminal = scope.active_terminals[data.id];
                    })
                });
                socket.emit('terminal.list');
            }
        };
    })
    .directive('myEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                switch (event.which) {
                    case 13:
                        scope.$apply(function () {
                            scope.$eval(attrs.myEnter);
                        });
                        event.preventDefault();
                        break;
                    case 38:
                        scope.$apply(function () {
                            scope.$eval('history(1)');
                        });
                        event.preventDefault();
                        break;
                    case 40:
                        scope.$apply(function () {
                            scope.$eval('history(-1)');
                        });
                        event.preventDefault();
                        break;
                }





            });
        };
    });


