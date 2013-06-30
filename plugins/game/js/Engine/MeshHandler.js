/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/

IronbaneApp
    .factory('MeshHandler', ['$log', '$cacheFactory', '$http', '$q',
    function($log, $cacheFactory, $http, $q) {

        var meshCache = $cacheFactory('meshCache'),
            geometryCache = $cacheFactory('geometryCache');

        function loadMeshData(url) {
            return $http.get(url, {
                cache: meshCache
            }).then(function(response) {
                // pass the results along for now
                return response.data;
            }, function(err) {
                return $q.reject('error loading model: ' + err);
            });
        }

        var handler = {
            Load: function(model, callback, scale) {
                if(geometryCache.get(model)) {
                    callback.call(null, THREE.GeometryUtils.clone(geometryCache.get(model)));
                    return;
                }

                loadMeshData(model).then(function(json) {
                    var loader = new THREE.JSONLoader(),
                        texturePath = loader.extractUrlBase(model),
                        geoCallback = function(geometry) {
                            geometryCache.put(model, geometry);
                            callback.call(null, THREE.GeometryUtils.clone(geometry));
                        };

                    loader.createModel(json, geoCallback, texturePath, scale);
                }, function(err) {
                    $log.log('error getting mesh', model, err);
                });
            },
            SpiceGeometry: function(geometry, rotation, metadata, meshData, param, drawNameMesh) {
                var rotationMatrix = new THREE.Matrix4();
                rotationMatrix.setRotationFromEuler(new THREE.Vector3(
                    (rotation.x).ToRadians(), (rotation.y).ToRadians(), (rotation.z).ToRadians()
                ));

                for (var v = 0; v < geometry.vertices.length; v++) {
                    geometry.vertices[v] = rotationMatrix.multiplyVector3(geometry.vertices[v]);
                }

                geometry.computeCentroids();
                geometry.computeFaceNormals();
                geometry.computeVertexNormals();

                geometry.dynamic = true;

                var tiles = [],
                    x = 0;
                for (x = 1; x <= 10; x++) {
                    if (angular.isDefined(metadata["t" + x])) {
                        tiles.push("tiles/" + metadata["t" + x]);
                    } else if (angular.isDefined(meshData["t" + x])) {
                        tiles.push(meshData["t" + x]);
                    } else {
                        tiles.push(1);
                    }
                }

                var uvscale = [];
                for (x = 1; x <= 10; x++) {
                    if (angular.isDefined(metadata["ts" + x])) {
                        uvscale.push(new THREE.Vector2(parseFloat(metadata["ts" + x]), parseFloat(metadata["ts" + x])));
                    } else if (ISDEF(meshData["ts" + x])) {
                        uvscale.push(new THREE.Vector2(parseFloat(meshData["ts" + x]), parseFloat(meshData["ts" + x])));
                    } else {
                        uvscale.push(new THREE.Vector2(1, 1));
                    }
                }

                var materials = [];
                // Only push materials that are actually inside the materials
                for (var i = 0; i < geometry.jsonMaterials.length; i++) {
                  if (drawNameMesh) {
                      materials.push(textureHandler.GetTexture('plugins/game/images/' + tiles[i] + '.png', false, {
                          transparent: true,
                          opacity: 0.5,
                          seeThrough: true,
                          alphaTest: 0.5,
                          uvScaleX: uvscale[i].x,
                          uvScaleY: uvscale[i].y
                      }));
                  } else {
                      materials.push(textureHandler.GetTexture('plugins/game/images/' + tiles[i] + '.png', false, {
                          transparent: meshData["transparent"] === 1,
                          alphaTest: 0.1,
                          useLighting: true
                      }));
                  }

                  materials[i].shading = THREE.FlatShading;
                }

                geometry.materials = materials;

                return geometry;
            },
            '$meshCache': meshCache,
            '$geometryCache': geometryCache
        };

        return handler;
    }])
    .run(['MeshHandler', '$log', function(MeshHandler, $log) {
        $log.log('super hack!');
        window.meshHandler = MeshHandler;
    }]);
