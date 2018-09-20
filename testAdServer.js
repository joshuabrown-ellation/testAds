'use strict';

/**
 * testAdServer.js
 *
 * invoked by "node testAdServer.js [port]" with optional port number
 *
 * starts a node http instance
 * returns ads when calling "localhost:port/type"
 *
 */
const http = require('http'),
    url = require('url'),
    fs = require('fs'),
    endpoints = [ //  the possible loca
        'vast',
        'vpaid',
        'headerBid',
        'longVast',
        'longVpaid',
        'longHeaderBid',
        'emptyVast',
        'emptyBody',
        'noResponse',
        'tracker',
        'malformedVast',
    ],
    vastFileNames = [
        'vastWrapperZero.xml',
        'vastWrapperOne.xml',
        'vastWrapperTwo.xml'
    ],
    vpaidFileNames = [
        'vpaidWrapperZero.xml',
        'vpaidWrapperOne.xml',
        'vpaidWrapperTwo.xml',
    ],
    headerBidFileNames = [
        'headerBidZero.xml',
        'headerBidOne.xml',
        'headerBidTwo.xml',
    ],
    longVastNames = [
        'longVastZero.xml',
        'longVastOne.xml',
        'longVastTwo.xml'
    ],
    longVpaidNames = [
        'longVpaidZero.xml',
        'longVpaidOne.xml',
        'longVpaidTwo.xml',
    ],
    longHeaderNames = [
        'longHeaderBidZero.xml',
        'longHeaderBidOne.xml',
        'longHeaderBidTwo.xml',
    ],
    responseGroups = [
        vastFileNames,
        vpaidFileNames,
        headerBidFileNames,
        longVastNames,
        longVpaidNames,
        longHeaderNames,
    ];

let port = 9000,  // default port number if not configured by argument
    trackingEvents = [];

if ( process.argv.length > 2 ) { // the node invocation can override default port
    port = process.argv[2];
}

function track ( request ) {
    // TODO: do something with the tracking!.  Like, increment array of types, processing the params or something...
}

const server = http.createServer( function ( request, response ) {
    let parsedRequestUrl,
        requestPathName,
        query,
        matchingTypeArray,
        endpoint,
        i,
        result;

    parsedRequestUrl = url.parse( request.url, true );
    query = parsedRequestUrl.query;
    requestPathName = parsedRequestUrl.pathname.substring( 1 );
    i = endpoints.indexOf( requestPathName );

    if ( i > -1 ) { // if this is an actual endpoint
        matchingTypeArray = responseGroups[ i ];
        switch ( i ) {
            case 0: // vast
            case 1: // vpaid
            case 3: // long vast
            case 4: // long vpaid
                // randomly select one of the available resources and return it's wrapper
                endpoint = __dirname + '/ads/' + matchingTypeArray[ Math.floor( Math.random() * matchingTypeArray.length ) ];

                try {
                    result = fs.readFileSync( endpoint );
                } catch (e) {
                    result = fs.readFileSync( __dirname + '/ads/empty.xml' );
                }

                response.writeHead( 200, { 'Content-Type': 'text/xml', 'Access-Control-Allow-Origin': '*' } );
                response.end( result );
                break;
            case 2: // header bid
            case 5: // long header bid
                /**
                 * success conditions
                 * not only are there the two keys,
                 * the values are populated, if they are not, they will remain in unpopulated macro form
                 */
                if (
                    query.amzn_vid &&
                    query.amznslots &&
                    query.amzn_vid !== '{a9_amzniid}' &&
                    query.amznslots !== '{a9_amznbid}'
                ) {
                    // randomly select one of the available resources and return it's wrapper
                    endpoint = __dirname + '/ads/' + matchingTypeArray[ Math.floor( Math.random() * matchingTypeArray.length ) ];

                    try {
                        result = fs.readFileSync( endpoint );
                    } catch (e) {
                        result = fs.readFileSync( __dirname + '/ads/empty.xml' );
                    }

                    response.writeHead( 200, { 'Content-Type': 'text/xml', 'Access-Control-Allow-Origin': '*' } );
                    response.end( result );
                } else {
                    result = fs.readFileSync( __dirname + '/ads/empty.xml' );
                    response.writeHead( 200, { 'Content-Type': 'text/xml', 'Access-Control-Allow-Origin': '*' } );
                    response.end( result );
                }

                break;
            case 6:  // force requesting empty vast
                result = fs.readFileSync( __dirname + '/ads/empty.xml' );
                response.writeHead( 200, { 'Content-Type': 'text/xml', 'Access-Control-Allow-Origin': '*' } );
                response.end( result );

                break;
            case 7:  // force requesting empty body
                response.writeHead( 200, { 'Access-Control-Allow-Origin': '*' } );
                response.end();
                break;
            case 8:  // force requesting that no response be sent
                break;
            case 9:
                // todo: do something with trackers!
                track( request );
                response.end();
                break;
            case 10: // malformed vast :)
                result = fs.readFileSync( __dirname + '/ads/malformed.xml' );
                response.writeHead( 200, { 'Content-Type': 'text/xml', 'Access-Control-Allow-Origin': '*' } );
                response.end( result );
                break;
            default: // unknown type
                response.end();
                break;
        }
    } else {
        response.writeHead( 404, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' } );
        response.end( fs.readFileSync( __dirname + '/resources/404.html' ) );
    }
});

server.listen( port );