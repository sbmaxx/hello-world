var assert = require('assert');
var net = require('net');
var open = process.binding('fs').open;
var sendfile = process.binding('fs').sendfile;

if (process.argv.length < 4) {
    console.error('usage: sendfile <port> <path>');
    process.exit(1);
}

var port = parseInt(process.argv[2]);
var path = process.argv[3];
var bufSz = 1 << 10;

console.log('Sending ' + path + ' to all connections on port ' + port);

net.createServer(function(s) {
    open(path, process.O_RDONLY, 0, function(err, fd) {
        // Track our offset in the file outside of sendData() so that its value
        // is stable across multiple invocations
        var off = 0;

        var sendData = function() {
            // We only care about the 'drain' event if we're not done yet
            s.removeListener('drain', sendData);

            try {
                // Try to send file data until we either hit EOF, or fail the
                // write due to EAGAIN
                do {
                    nbytes = sendfile(s.fd, fd, off, bufSz);
                    off += nbytes;
                } while (nbytes > 0);

                s.end();
            } catch (e) {
                // Only EAGAIN is special; everything else is fatal
                if (e.errno !== process.EAGAIN) {
                    throw e;
                }

                // When the socket has room for more data, start pumping again
                s.on('drain', sendData);

                // Manually fire up the IOWatcher so that the 'drain' event
                // fires. The net.Stream class usually manages this for you,
                // but since we're going around it via sendfile(), we have to
                // do this manually.
                s._writeWatcher.start();
            }
        };

        if (err) {
            console.error(err);
            s.end();
            return;
        }

        // Kick off the transfer
        sendData();
    });
}).listen(port);
