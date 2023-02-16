/*
Copyright 2020- IBM Inc. All rights reserved

SPDX-License-Identifier: Apache2.0
*/

const express = require( "express" ) ;
const app = express() ;
const cors = require( 'cors' ) ;
const fs = require( 'fs' ) ;
const natural = require( 'natural' ) ;
const swaggerJsDoc = require( 'swagger-jsdoc' ) ;
const swaggerUi = require( 'swagger-ui-express' ) ;

const PORT = process.env.PORT || 8080 ;

if ( process.env.NODE_ENV === 'development' ) {
    require('dotenv').config();
}

app.use( '/static', express.static(__dirname + '/static') ) ;
app.use( '/incltech/static', express.static(__dirname + '/static') ) ;
app.use( cors() ) ;
app.use( cors( { origin: '*' } ) ) ;
app.options( '*', cors() ) ;
app.use( (req, res, next ) => {
    res.header( 'Access-Control-Allow-Origin', '*' ) ;
    res.header( 'Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE' ) ;    
    res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' ) ;
    res.header( 'Access-Control-Allow-Credentials', true ) ; 
    next() ;
});

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Responsible and Inclusive Tech API',
            description: 'Support people to use the R&I Framework, enabling easier connection of multiple content management systems to a recommendation service that brings contextualized R&I information. The recommendations provided involve stakeholders, questions from the framework, and definitions about R&I terms. More information about Responsible & Inclusive Tech group: https://w3.ibm.com/w3publisher/responsible-and-inclusive-technology/',
            contact: {
                name: 'Vagner Santana',
                email: 'vagsant@br.ibm.com'
            }
        }
    },
    apis: ['server.js']
}

const swaggerDocs = swaggerJsDoc( swaggerOptions ) ;
app.use('/incltech/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerDocs ) ) ;

/*******************************
 * Utility Functions
 *******************************/

 var stage_classifier = null ;
 var time_classifier = null ;
 var type_classifier = null ; 
 var force_classifier = null ; 
 var tfidf = null ;

/**
 * Function to init endpoint configurations and to train classifiers.
 */
function init(){
    console.time( '--> Init' ) ;
    // console.time( 'Loading questions' ) ;
    var questions = fs.readFileSync( './static/json/framework_questions.json' ) ;
    q = JSON.parse( questions ) ; 
    let count = 0 ;
    let suitsCount = {} ;
    for( let i = 0; i < q.length; i++ ){
        if( q[i].text ){
            count++ ;
            if( suitsCount[ q[i].suit ] ){
                suitsCount[ q[i].suit ]++ ;
            }
            else{
                suitsCount[ q[i].suit ] = 1 ;
            }
        }
    }
    console.debug( 'Questions/principles found: ' + count ) ;
    for( s in suitsCount ){
        console.debug( '\t' + s + ': ' + suitsCount[ s ] ) ;
    }
    // console.timeEnd( 'Loading questions' ) ;

    // console.time( 'Loading glossary' ) ;
    var glossary = fs.readFileSync( './static/json/glossary.json' ) ;
    var g = JSON.parse( glossary ) ; 
    console.debug( 'Glossary terms found: ' + g.length ) ;
    // console.timeEnd( 'Loading glossary' ) ;


    // Initializing Bayes Classifiers and TFIDF
    stage_classifier = new natural.BayesClassifier() ;
    time_classifier = new natural.BayesClassifier() ;
    type_classifier = new natural.BayesClassifier() ;
    force_classifier = new natural.BayesClassifier() ;
    tfidf = new natural.TfIdf() ;    

    // Training the Bayes Classifiers
    // console.time( 'Labeling questions' ) ;
    if( q.length ){
        for( let i = 0; i < q.length; i++ ){
            if( q[i].text ){
                tfidf.addDocument( q[i].text ) ;
                for( let j = 0; j < q[i].stage.length; j++ ){
                    stage_classifier.addDocument( q[i].text, q[i].stage[j] ) ;
                }
                for( let j = 0; j < q[i].time.length; j++ ){
                    time_classifier.addDocument( q[i].text, q[i].time[j] ) ;
                }
                for( let j = 0; j < q[i].type.length; j++ ){
                    type_classifier.addDocument( q[i].text, q[i].type[j] ) ;
                }            
                for( let j = 0; j < q[i].force.length; j++ ){
                    force_classifier.addDocument( q[i].text, q[i].force[j] ) ;
                }
            }
        }
    }
    // console.timeEnd( 'Labeling questions' ) ;

    console.time( 'Training classifiers' ) ;
    stage_classifier.train() ;
    time_classifier.train() ;
    type_classifier.train() ;
    force_classifier.train() ;
    console.timeEnd( 'Training classifiers' ) ;
    
    console.timeEnd( '--> Init' ) ;
    return [q, g] ;
}

/********************
 * GET Routes
 *******************/

/**
  * @swagger
  * /incltech/question/{content}:
  *   get:
  *     description: Recommends self-reflective R&I content given a textual input content. <br><br><img src="/incltech/static/images/question-1.png" width="50%"> <img src="/incltech/static/images/question-2.png" width="50%"> <img src="/incltech/static/images/question-3.png" width="50%">
  *     produces: 
  *       - application/json
  *     parameters:
  *       - name: content
  *         description: Textual content.
  *         in: path
  *         required: true
  *         type: string
  *         example: how can I incorporate responsible and inclusive aspects into my project that is already in course?
  *     responses:
  *       '200':
  *         description: Returns 0 or more R&I self-reflective questions.
  */
app.get( "/incltech/question/:content", ( req, res ) => {
    var content = req.params.content ;    

    // TODO: Add principles from https://w3.ibm.com/w3publisher/ai-contentops/ai-ethics-for-content-design/contributing-factors to framework_question.json
    // TODO: Add guidances & policies from Trust bot

    // TODO: Add a markup so that technologies, project, AI, quantum can be covered by principles & questions

    // Predicting each label type for the input content
    // console.time( 'Predicting labels' ) ;
    var stage = stage_classifier.classify( content ) ;
    var time = time_classifier.classify( content ) ;
    var type = type_classifier.classify( content ) ;
    var force = type_classifier.classify( content ) ;
    // console.timeEnd( 'Predicting labels' ) ;

    var out = [] ;
    max_tfidf = 0 ;
    // console.time( 'Finding intersecting labels' ) ;
    for( let i = 0; i < q.length; i++ ){
        // Retrieving the questions with intersecting predicted labels
        if( q[i].stage !== undefined && q[i].time !== undefined && q[i].type !== undefined && q[i].force !== undefined ){
            if( stage in q[i].stage && time in q[i].time && type in q[i].type && force in q[i].force ){
                // Retrieving TFIDF for the selected content
                let metric = tfidf.tfidf( content, i ) ;
                if( metric > max_tfidf ){
                    max_tfidf = metric ;
                }
                if( metric > 0 ){
                    q[i][ 'tfidf' ] = metric ;
                    out.push( q[i] ) ;
                }
            }
        }
    }
    // console.timeEnd( 'Finding intersecting labels' ) ;

    // Retrieving content with similar TFIDFs
    // console.time( 'Retrieving questions based on TFIDF' ) ;
    tfidf.tfidfs( content, function( i, metric ){
        if( metric >= max_tfidf && metric > 0 ){
            q[i][ 'tfidf' ] = metric ;
            out.push( q[i] ) ;
        }
    } ) ;
    // console.timeEnd( 'Retrieving questions based on TFIDF' ) ;

    // Ranking by TFIDF
    // console.time( 'Sorting questions based on TFIDF' ) ;
    out.sort( function( a, b ){ return b.tfidf - a.tfidf } ) ;
    // console.timeEnd( 'Sorting questions based on TFIDF' ) ;

    // Sentiment analysis
    var Analyzer = natural.SentimentAnalyzer ;
    var stemmer = natural.PorterStemmer ;
    var analyzer = new Analyzer( 'English', stemmer, 'senticon' ) ;
    var tokenizer = new natural.WordTokenizer() ;
    sentiment = analyzer.getSentiment( tokenizer.tokenize( content ) ) ;

    // Retrieving content
    res.send( { sentiment: sentiment, questions: out } ) ;
} ) ;


/**
  * @swagger
  * /incltech/class/{content}:
  *   get:
  *     description: Retrieves labels related to R&I framework questions given a textual input content. 
  *     produces: 
  *       - application/json
  *     parameters:
  *       - name: content
  *         description: Textual content.
  *         in: path
  *         required: true
  *         type: string
  *         example: how can I incorporate responsible and inclusive aspects into my project that is already in course?
  *     responses:
  *       '200':
  *         description: Returns 0 or more classes related to R&I Framework questions.
  */
 app.get( "/incltech/class/:content", ( req, res ) => {
    var content = req.params.content ;
    var out = [] ;

    // Predicting each label type for the input content
    // console.time( 'Predicting labels' ) ;
    out.push( { name: 'stage', value: stage_classifier.classify( content ) } ) ;
    out.push( { name: 'time', value: time_classifier.classify( content ) } ) ;
    out.push( { name: 'type', value: type_classifier.classify( content ) } ) ;
    out.push( { name: 'force', value: force_classifier.classify( content ) } ) ;
    // console.timeEnd( 'Predicting labels' ) ;

    // Retrieving content
    res.send( { classes: out } ) ;
} ) ;



/**
  * @swagger
  * /incltech/define/{content}:
  *   get:
  *     description: Retrieves definition for the input term. 
  *     produces: 
  *       - application/json
  *     parameters:
  *       - name: content
  *         description: Textual content.
  *         in: path
  *         required: true
  *         type: string
  *         example: Attribute
  *     responses:
  *       '200':
  *         description: Returns the definition for the input term if any.
  */
 app.get( "/incltech/define/:content", ( req, res ) => {
    var content = String( req.params.content ).toLowerCase() ;
    var out = [] ;
    var min_distance = 100*100 ;
    var threshold = Math.round( content.length * 0.1 ) ;

    // TODO: Break down content into n-grams prior to look up definitions

    // TODO: Add terms from https://w3.ibm.com/ibm/privacy/glossary
    // TODO: Add terms from https://w3.ibm.com/w3publisher/ai-ethics/knowledge-base/glossary

    // Finding definition in the glossary
    // console.time( 'Looking for definition' ) ;
    for( let i = 0; i < g.length; i++  ){
        let distance = natural.LevenshteinDistance( content, String( g[i].term ).toLowerCase() ) ;
        if( distance < min_distance && distance <= threshold ){
            min_distance = distance ;
            out = g[i] ;
        }
    }
    // console.timeEnd( 'Looking for definition' ) ;
    // console.debug( 'Looking for ' + content + ', ' + out.term + ' found! d = ' + min_distance ) ;

    // Retrieving content
    res.send( out ) ;   
} ) ;


/**
  * @swagger
  * /incltech/initgame/{size}:
  *   get:
  *     description: Retrieves card deck for the card game. This endpoint depends on the size of the deck. If considers the core questions first and then add random cards until the informed number is reached.
  *     produces: 
  *       - application/json
  *     parameters:
  *       - name: size
  *         description: Size of the deck to be retrieved.
  *         in: path
  *         required: true
  *         type: string
  *         example: 50
  *     responses:
  *       '200':
  *         description: Retrieves card deck for the card game.
  */
app.get( "/incltech/initgame/:size([0-9]{2})", ( req, res ) => { // TODO: use seedrandom to allow people to resume the game
    var deckSize = 50 ; // Default deck size
    if( Number.isInteger( Number.parseInt( req.params.size ) ) ){
        deckSize = req.params.size ;
    }
    var out = [] ;
    var questions = fs.readFileSync( './static/json/framework_questions.json' ) ;
    q = JSON.parse( questions ) ; 
    // Minimum size defined as 20; we have 13 core questions
    if( deckSize >= 20 && deckSize < q.length ){
        // Add all core questions first, then pick additional ones randomly
        for( let i = 0; i < deckSize && i < q.length; i++  ){
            if( q[i].core == true ){ 
                out.push( q[i] ) ;
                q.splice( i, 1 ) ;
            }
        }

        do{
            for( let i = 0; out.length < deckSize && i < q.length; i++  ){
                if( Math.random() > 0.5 ){
                    out.push( q[i] ) ;
                    q.splice( i, 1 ) ;
                }
            }
        } while( out.length < deckSize ) ;
    
        // Shuffle deck
        out = out.sort( () => Math.random() - 0.5 ) ;
        console.debug( 'Retrieving deck with ' + deckSize + ' cards.' ) ;
    }
    else{
        console.error( 'Deck size is invalid ( ' + deckSize +' ). Please use an integer between 20 and ' + q.length ) ;
    }

    // Retrieving content
    res.send( out ) ;   
} ) ;


/**
  * @swagger
  * /incltech/initgame/:
  *   get:
  *     description: Retrieves card deck for the card game based on the card dependencies. If starts from the root question(s) and performs a depth-first traversal over the graph. While adding next nodes do visit to the stack, it shuffles the list of neighbor nodes to add some randomness to the deck.
  *     produces: 
  *       - application/json
  *     parameters:
  *       - name: mode
  *         description: Game mode to go to a specific set of cards based on phase or suit
  *         in: path
  *         required: false
  *         type: string
  *         example: phase2
  *     responses:
  *       '200':
  *         description: Retrieves card deck for the card game based on the card dependencies.
  */
 app.get( '/incltech/initgame/:mode([a-z]+[1-4]?)', ( req, res ) => { 
    var mode = String( req.params.mode ).toLowerCase() ;
    console.debug( 'Game mode = ' + mode ) ;
    var stack = [] ; // Stack used to perform a depth-first search in the framework question dependency tree

    switch( mode ){
        case 'phase1': 
            stack = [6] ; // root id for the level plus discussion cards
            break ;
        case 'phase2':
            stack = [48, 85, 1] ; // root id for the level plus discussion cards
            break ;
        case 'phase3':
            stack = [75] ; // root id for the level plus discussion cards
            break ;
        case 'phase4':
            stack = [112, 60] ; // root id for the level plus discussion cards
            break ;
        case 'history':
            stack = [58, 119, 78, 38, 47, 13] ; // history
            break ;            
        case 'stakeholder':
            stack = [121, 122, 29, 40, 71, 98, 41, 79] ; // stakeholder
            break ;                        
        case 'impact':
            stack = [112, 61, 62, 90, 113, 117, 54, 55, 48, 85, 51, 89, 101, 65, 33, 16, 80, 83, 15, 8] ; // impact and outcomes
            break ;            
        case 'practices':
            stack = [127, 126, 59, 31, 125, 124, 57, 142, 141, 30, 35, 19, 82, 28, 26, 81, 25, 11, 12, 56] ; // practices and actions
            break ;
        default:
            stack = [60, 112, 75, 85, 1, 6] ; // pending nodes to visit; starting with phase 1, question (5)
        } 

    var out = [] ;
    var questions = fs.readFileSync( './static/json/framework_questions.json' ) ;
    q = JSON.parse( questions ) ; 

    while( stack.length > 0 ){
        let node = stack.pop() ; // node Id

        if( node != undefined ){
            // q is 0-indexed
            out.push( q[ node - 1 ] ) ;
            // console.debug( 'index=' + ( node ) + ', ' + q[ node - 1 ].text ) ;
            // console.debug( 'index=' + ( node ) )
            if( q[ node - 1 ].next ){
                if( q[ node - 1 ].next != [] ){
                    // shuffle next cards before adding to the stack to add some randomness to the deck
                    let next = q[ node - 1 ].next ;
                    next = next.sort( () => Math.random() - 0.5 ) ;
                    stack = stack.concat( next ) ;
                }
            }
        }
    }

    console.debug( 'Retrieving deck with ' + out.length + ' cards.' ) ;

    // Retrieving content
    res.send( out ) ;
});

/**
  * @swagger
  * /incltech/initgame/{ids}:
  *   get:
  *     description: Retrieves card deck of a previous game. This endpoint depends on a previous deck.
  *     produces: 
  *       - application/json
  *     parameters:
  *       - name: size
  *         description: Array of ids of a previously created deck.
  *         in: path
  *         required: true
  *         type: string
  *         example: 1,5,3,4
  *     responses:
  *       '200':
  *         description: Retrieves card deck for the card game.
  */
 app.get( "/incltech/initgame/:ids([0-9,]+)", ( req, res ) => { // TODO: use seedrandom to allow people to resume the game
    var ids = String( req.params.ids ).toLowerCase() ;
    ids = ids.split( "," ) ;
    var out = [] ;
    var questions = fs.readFileSync( './static/json/framework_questions.json' ) ;
    q = JSON.parse( questions ) ;
    let map = {} ;
    for( let i = 0; i < q.length; i++ ){
        map[ q[i].id ] = q[i] ;
    }
    for( let i = 0; i < ids.length; i++ ){
        out.push( map[ ids[i] ] ) ;
    }
    // Retrieving content
    res.send( out ) ;   
} ) ;

/**
  * @swagger
  * /incltech/questions/:
  *   get:
  *     description: Retrieves a file with framework questions.
  *     produces: 
  *       - text/csv
  *     responses:
  *       '200':
  *         description: Retrieves a file with framework questions.
  */
 app.get( "/incltech/questions/", ( req, res ) => {
    var outHeader = "Suit;Phase;Code;Question\n" ;
    var questions = fs.readFileSync( './static/json/framework_questions.json' ) ;
    q = JSON.parse( questions ) ;
    out = []
    for( let i = 0; i < q.length; i++ ){
        if( q[i].suit && q[i].text ){
            if( q[i].suit != "principle" ){
                out.push( q[i].suit + ";" + q[i].phase + ";" + q[i].code + ";" +  q[i].text ) ;
            }
        }
    }
    out = out.sort() ;
    out = outHeader + out.join( "\n"  )
    // Retrieving content
    res.send( out ) ;   
} ) ;


/*******************************
 * Card Game (Multiplayer)
 *******************************/

// const game = express() ;
// const gameServer = require( 'http' ).createServer( game ) ;
// const io = require( 'socket.io' )( gameServer ) ;

// game.use( express.static(__dirname + '/static') ) ;
// game.set( 'views', __dirname + '/static' ) ;
// game.engine( 'html', require( 'ejs' ).renderFile ) ;
// game.set( 'view engine', 'html' ) ;

// game.use( '/', ( req, res ) => {
//     res.render( 'game.html' ) ;
// } ) ;

// io.on( 'connection', socket => {
//     console.debug( 'Socket id = ' + socket.id ) ;
// } ) ;

// gameServer.listen( 9000 ) ;

/**
 * Initializing classifiers
 */
 var [q, g] = init() ;

/**
 * Starting the server
 */
 app.listen( PORT ) ;