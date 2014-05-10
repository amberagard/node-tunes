'use strict';

var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');


exports.index = (req, res)=>{
  songs.find().toArray((err, songs)=>{
      res.render('songs/index', {songs: songs, title: 'Song Page'});
  });
};

exports.create = (req, res)=>{
    var form = new multiparty.Form();
    form.parse(req, (err, fields, files)=>{
        var song = {};

        song.name = fields.name[0];

    });

};
