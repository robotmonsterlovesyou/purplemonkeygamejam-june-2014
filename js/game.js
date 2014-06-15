define(function (require) {

    'use strict';

    var Facade = require('facade'),
        Game = require('game'),
        Gamepad = require('gamepad'),
        $ = require('jquery'),
        Box2D = require('box2dweb'),
        randomColor = require('randomColor'),
        gameScene = new Game.Scene('game');

    require('facadejs-Box2D');

    gameScene.init(function (game) {

        var self = this,
            // debugDraw = new Box2D.Dynamics.b2DebugDraw(),
            listener = new Box2D.Dynamics.b2ContactListener(),
            currentEnemyShape;

        this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 40), false);

        ['PreSolve', 'PostSolve', 'BeginContact', 'EndContact'].forEach(function (type) {

            listener[type] = (function (entities) {

                var a = entities.GetFixtureA().GetBody().GetUserData(),
                    b = entities.GetFixtureB().GetBody().GetUserData();

                if (a && typeof a._box2d.callback[this.type] === 'function') {

                    a._box2d.callback[this.type].call(a, a, b);

                }

                if (b && typeof b._box2d.callback[this.type] === 'function') {

                    b._box2d.callback[this.type].call(b, a, b);

                }

            }).bind({ type: type });

        });

        this.world.SetContactListener(listener);

        // debugDraw.SetSprite(game.stage.context);
        // debugDraw.SetDrawScale(30);
        // debugDraw.SetFillAlpha(0.3);
        // debugDraw.SetLineThickness(1.0);
        // debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit);
        // this.world.SetDebugDraw(debugDraw);

        this.assets = {
            player: null,
            enemies: [],
            map: [],
            camera: [0, 0],
            score: new Facade.Text('Score: 0', {
                x: 10,
                y: 10,
                fontFamily: 'Helvetica-Light',
                fontSize: 20,
                fillStyle: '#fff',
                anchor: 'top/left'
            })
        };
        this.methods = {};

        this.score = 0;

        this.gamepad = new Gamepad();

        $.get('data/level1.json').done(function (data) {

            function populateEnemies() {

                var i,
                    length,
                    enemiesArray = [];

                for (i = 0, length = 25 - self.assets.enemies.length; i < length; i += 1) {

                    currentEnemyShape = data.enemies.shapes[Math.floor(Math.random() * data.enemies.shapes.length)];

                    self.assets.enemies.push(new Facade.Polygon(
                        $.extend(
                            { x: Math.random() * 9000, y: Math.random() * -500, fillStyle: '#111' },
                            currentEnemyShape.options
                        )
                    ));

                    self.assets.enemies[self.assets.enemies.length - 1]._scale = 1;

                    self.assets.enemies[self.assets.enemies.length - 1]._color = randomColor({ luminosity: 'light', format: 'rgb' });

                    self.assets.enemies[self.assets.enemies.length - 1].Box2D('createObject', self.world, data.enemies.settings);

                    self.assets.enemies[self.assets.enemies.length - 1]._box2d.entity.SetBullet(true);

                    self.assets.enemies[self.assets.enemies.length - 1].Box2D('setForce', -(Math.random() * 20 + 5), 0);

                    self.assets.enemies[self.assets.enemies.length - 1].Box2D('setCallback', 'PreSolve', function (a, b) {

                        if (self.assets.player === b && !a._collided) {

                            a.setOptions({ fillStyle: a._color });

                            a._collided = true;

                            self.score++;

                        }

                    });

                }

                self.assets.enemies.forEach(function (enemy) {

                    if (enemy.Box2D('getCurrentState') && enemy.Box2D('getCurrentState').x + enemy.getMetric('width') < 0) {

                        enemy.Box2D('destroyObject');

                    } else {

                        enemiesArray.push(enemy);

                    }

                });

                return enemiesArray;

            }

            self.assets.player = new Facade.Polygon(data.player.options);

            self.assets.player.Box2D('createObject', self.world, data.player.settings);

            self.gamepad.on('press', 'button_1', function () {

                self.assets.player.Box2D('setVelocity', self.assets.player.Box2D('getVelocity').x, -20);

            });

            self.gamepad.on('hold', 'd_pad_left', function () {

                var ratio = (self.assets.player.getMetric('x') + self.assets.camera[0]) / game.stage.width();

                if (self.assets.player.getMetric('x') + self.assets.camera[0] < 400 && self.assets.camera[0] < 0) {

                    self.assets.camera[0] += data.player.properties.speed / 2 + ratio;

                }

                self.assets.player.Box2D('setVelocity', -data.player.properties.speed, self.assets.player.Box2D('getVelocity').y);

            });

            self.gamepad.on('hold', 'd_pad_right', function () {

                var ratio = (self.assets.player.getMetric('x') + self.assets.camera[0]) / game.stage.width();

                if (self.assets.player.getMetric('x') + self.assets.camera[0] > 800) {

                    self.assets.camera[0] -= data.player.properties.speed / 2 + ratio;

                }

                self.assets.player.Box2D('setVelocity', data.player.properties.speed, self.assets.player.Box2D('getVelocity').y);

            });

            self.assets.enemies = populateEnemies();

            window.setInterval(function () {

                self.assets.enemies = populateEnemies();

            }, 100);

            window.setInterval(function () {

                self.assets.enemies.forEach(function (enemy) {

                    if (!enemy._scale || enemy._scale <= 1) {

                        enemy._scale = 1.5;

                    }

                });

            }, 500);

            $.get(data.map.file).done(function (svg) {

                Array.prototype.slice.call(svg.getElementsByTagName('path')).forEach(function (tag) {

                    var coords = tag.getAttribute('d').replace(/[a-z]/ig, '').replace(/^\s|\s$/g, '').split(/\s/),
                        position = tag.parentNode.getAttribute('transform').match(/([0-9\.]+), ([0-9\.]+)/),
                        points = [],
                        object;

                    coords.pop(); // Prevent duplicate point (manual closing of polygon).

                    coords.forEach(function (coord) {

                        coord = coord.split(/\,/);

                        points.push([parseFloat(coord[0]), parseFloat(coord[1])]);

                    });

                    object = new Facade.Polygon($.extend({
                        x: position[1],
                        y: position[2],
                        points: points
                    }, data.map.options));

                    object.Box2D('createObject', self.world, data.map.setting);
                    self.assets.map.push(object);

                });

            });

        });

    });

    gameScene.draw(function (game) {

        game.stage.clear();

        this.world.Step(1 / 60, 8, 3);

        game.stage.context.save();

        game.stage.context.globalAlpha = (Math.random() * 50 + 50) / 100;

        game.stage.context.drawImage(game.getPreviousScene().assets.sky.canvas, 0, 0);

        game.stage.context.restore();

        this.assets.score.setText(this.assets.score.value.replace(/[0-9]+/, this.score));

        game.stage.addToStage(this.assets.score);

        game.stage.context.translate.apply(game.stage.context, this.assets.camera);

        if (this.assets.player) {

            this.assets.player.setOptions(this.assets.player.Box2D('getCurrentState'));

            game.stage.addToStage(this.assets.player);

        }

        if (this.assets.enemies.length) {

            this.assets.enemies.forEach(function (enemy) {

                if (enemy._scale > 1) {

                    enemy._scale -= 0.1;

                }

                game.stage.addToStage(enemy, $.extend({ scale: enemy._scale }, enemy.Box2D('getCurrentState')));

            });

        }

        if (this.assets.map.length) {

            game.stage.addToStage(this.assets.map);

        }

        // this.world.DrawDebugData();

    });

    return gameScene;

});
