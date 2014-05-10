'use strict';

var multiparty = require('multiparty');
var albums = global.nss.db.collection('albums');
var fs = require('fs');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  albums.find().toArray((err, albums)=>{
      res.render('albums/index', {albums: albums, title: 'Album Page'});
  });
};

exports.create = (req, res)=>{
    var form = new multiparty.Form();
    form.parse(req, (err, fields, files)=>{
        var photo = files.photo[0];

        var album = {
            name: fields.name[0],
            photo: photo.originalFilename
        };

        albums.save(album, ()=>{
            albums.find({name: album.name, photo: album.photo}).toArray((err, aAlbums)=>{
                if(aAlbums.length) {
                    aAlbums.forEach((a, i)=>{
                        var path = photo.path;
                        if(i < aAlbums.length - 1) {
                            var sourceData = fs.readFileSync(photo.path);
                            path = path.replace('.','temp.');
                            fs.writeFileSync(path, sourceData);
                        }
                        createAlbumDirectory(a, path);
                    });
                }
                function createAlbumDirectory(a, oldPath) {
                    var newPath = `${__dirname}/../static/img/albums/${a._id}`;
                    if(!fs.existsSync(newPath)) {
                        fs.mkdirSync(newPath);
                        fs.renameSync(oldPath, `${newPath}/${photo.originalFilename}`);
                    }
                }
            });

            res.redirect('/albums');
        });

    });
};

exports.show = (req, res)=>{
    var _id = Mongo.ObjectID(req.params.id);
    albums.findOne({_id:_id}, (e, album)=>{
        res.render('albums/show', {album: album, title: 'Album Show'});
  });
};