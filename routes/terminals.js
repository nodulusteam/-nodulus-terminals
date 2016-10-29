/*                 _       _
                 | |     | |
  _ __   ___   __| |_   _| |_   _ ___
 | '_ \ / _ \ / _` | | | | | | | / __|
 | | | | (_) | (_| | |_| | | |_| \__ \
 |_| |_|\___/ \__,_|\__,_|_|\__,_|___/
 @ewave open source | ©Roi ben haim  ®2016
 */
/// <reference path="../typings/main.d.ts" /> 
var express = require('@nodulus/core');
var router = express.Router();
var util = require('util');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var spawn = require('child_process').spawn;
global["terminals"] = {};
global["socket"].on('connection', function (socket) {
    global["rooms"][socket.id] = socket;

    socket.on('terminal.delete', function (data) {
        if (global["terminals"] && global["terminals"][socket.id]) {
            delete global["terminals"][socket.id][data];
        }
        if (global["terminals"] && global["terminals"][socket.id]) {
            var retArr = [];
            for (var key in global["terminals"][socket.id]) {
                retArr.push(key);
            }
            socket.emit('terminal.list', { 'terminals': retArr });
        }

    });

    socket.on('terminal.list', function (data) {
        if (global["terminals"] && global["terminals"][socket.id]) {
            var retArr = [];
            for (var key in global["terminals"][socket.id]) {
                retArr.push(key);
            }
            socket.emit('terminal.list', { 'terminals': retArr });
        }
    });
    socket.on('terminal.init', function (data) {



        if (!global["terminals"][socket.id] || !global["terminals"][socket.id][data]) {

            if (!global["terminals"][socket.id])
                global["terminals"][socket.id] = {};

            var terminal = global["terminals"][socket.id][data] = spawn('cmd', [], { stdio: ['pipe', 'pipe', 'pipe'] });
            terminal.id = data;
            terminal.stdout.on('data', function (data) {
                data = String.fromCharCode.apply(null, new Uint16Array(data));
                var lastRowpos = data.lastIndexOf('\r\n');
                console.log(data.substr(0, lastRowpos));
                console.log(data.substring(lastRowpos + 1));
                socket.emit('terminal.result', { 'id': terminal.id, 'stdout': data.substr(0, lastRowpos), 'stderr': null });

                socket.emit('terminal.result', { 'id': terminal.id, 'stdout': data.substring(lastRowpos + 1), 'stderr': null });


            });
            terminal.stdout.on('message', function (data) {
                data = String.fromCharCode.apply(null, new Uint16Array(data));
                socket.emit('terminal.result', { 'id': terminal.id, 'stdout': data, 'stderr': null });
            });
            terminal.stderr.on('data', function (data) {
                data = String.fromCharCode.apply(null, new Uint16Array(data));
                socket.emit('terminal.result', { 'id': terminal.id, 'stdout': data, 'stderr': null });
            });
            terminal.stderr.on('close', function (data) {
                debugger;
            });
        }
        socket.emit('terminal.init', { 'id': data });
    });
    socket.on('terminal.command', function (data) {
        var command = data.command + '\n';
        var terminal_id = data.id;
        var terminal = global["terminals"][socket.id][terminal_id];
        if (!terminal.history)
            terminal.history = [];
        terminal.history.push(command);
        terminal.stdin.setEncoding('utf-8');
        terminal.stdin.write(command);
        //
        //global["rooms"][socket.id]['terminal'](command, function (error, stdout, stderr) {
        //    socket.emit('terminal.result', { 'stdout': stdout, 'stderr': stderr } );
        //    console.log('stdout: ' + stdout);
        //    console.log('stderr: ' + stderr);
        //    if (error !== null) {
        //        console.log('exec error: ' + error);
        //    }
        //});
    });
});
function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i > strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
module.exports = router;
//# sourceMappingURL=terminal.js.map