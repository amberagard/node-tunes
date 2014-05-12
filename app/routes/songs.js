'use strict';

var albums = global.nss.db.collection('albums');
var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');
//var _ = require('lodash');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
    artists.find().toArray((err, artists)=>{
        albums.find().toArray((err, albums)=>{
            songs.find(req.query).toArray((err, songs)=>{


            res.render('songs/index', {artists: artists, albums: albums, songs: songs, title: 'Songs'});
            });
        });
    });
};

exports.create = (req, res)=>{
    var form = new multiparty.Form();

    form.parse(req, (err, fields, files)=>{
        var albumId = Mongo.ObjectID(fields.album[0]);
        albums.find({_id: albumId}).toArray((err, album)=>{
            var artistId = Mongo.ObjectID(fields.artist[0]);
            artists.find({_id: artistId}).toArray((err, artist)=>{
                var song = {};
                song.name = fields.title[0];
                song.genre = fields.genre[0].split(', ').map(w=>w.trim()).map(w=>w.toLowerCase());
                song.artist = artist;
                song.album = album;
                song.file = files.mp3[0].originalFilename;

                songs.save(song, ()=>{
                    songs.find({name: song.name}).toArray((err, songs)=>{
                        if(songs.length) {
                            songs.forEach((s, i)=>{
                                var path = files.mp3[0].path;
                                if(i < songs.length - 1) {
                                    var sourceData = fs.readFileSync(path);
                                    path = path.replace('.','temp.');
                                    fs.writeFileSync(path, sourceData);
                                }
                                createSongDirectory(s, path);
                            });
                        }
                        function createSongDirectory(s, oldPath) {
                            var newPath = `${__dirname}/../static/audios/songs/${s._id}`;
                            if(!fs.existsSync(newPath)) {
                                fs.mkdirSync(newPath);
                                fs.renameSync(oldPath, `${newPath}/${files.mp3[0].originalFilename}`);

                            }
                        }
                    });

                    res.redirect('/songs');
                });
            });
        });

    });

};
