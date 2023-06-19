var MarkerClustering = function (options) {
    this.DEFAULT_OPTIONS = {
        map: null,
        markers: [],
        disableClickZoom: true,
        minClusterSize: 2,
        maxZoom: 13,
        gridSize: 100,
        icons: [],
        indexGenerator: [10, 100, 200, 500, 1000],
        averageCenter: false,
        stylingFunction: function () { }
    };

    this._clusters = [];

    this._mapRelations = null;
    this._markerRelations = [];

    this.setOptions(naver.maps.Util.extend({}, this.DEFAULT_OPTIONS, options), true);
    this.setMap(options.map || null);
};

naver.maps.Util.ClassExtend(MarkerClustering, naver.maps.OverlayView, {
    onAdd: function () {
        var map = this.getMap();

        this._mapRelations = naver.maps.Event.addListener(map, 'idle', naver.maps.Util.bind(this._onIdle, this));

        if (this.getMarkers().length > 0) {
            this._createClusters();
            this._updateClusters();
        }
    },

    draw: naver.maps.Util.noop,

    onRemove: function () {
        naver.maps.Event.removeListener(this._mapRelation);

        this._clearClusters();

        this._geoTree = null;
        this._mapRelation = null;
    },

    setOptions: function (newOptions) {
        var _this = this;

        if (typeof newOptions === 'string') {
            var key = newOptions,
                value = arguments[1];

            _this.set(key, value);
        } else {
            var isFirst = arguments[1];

            naver.maps.Util.forEach(newOptions, function (value, key) {
                if (key !== 'map') {
                    _this.set(key, value);
                }
            });

            if (newOptions.map && !isFirst) {
                _this.setMap(newOptions.map);
            }
        }
    },

    getOptions: function (key) {
        var _this = this,
            options = {};

        if (key !== undefined) {
            return _this.get(key);
        } else {
            naver.maps.Util.forEach(_this.DEFAULT_OPTIONS, function (value, key) {
                options[key] = _this.get(key);
            });

            return options;
        }
    },

    getMinClusterSize: function () {
        return this.getOptions('minClusterSize');
    },

    setMinClusterSize: function (size) {
        this.setOptions('minClusterSize', size);
    },

    getMaxZoom: function () {
        return this.getOptions('maxZoom');
    },

    setMaxZoom: function (zoom) {
        this.setOptions('maxZoom', zoom);
    },

    getGridSize: function () {
        return this.getOptions('gridSize');
    },

    setGridSize: function (size) {
        this.setOptions('gridSize', size);
    },

    getIndexGenerator: function () {
        return this.getOptions('indexGenerator');
    },

    setIndexGenerator: function (indexGenerator) {
        this.setOptions('indexGenerator', indexGenerator);
    },

    getMarkers: function () {
        return this.getOptions('markers');
    },

    setMarkers: function (markers) {
        this.setOptions('markers', markers);
    },

    getIcons: function () {
        return this.getOptions('icons');
    },

    setIcons: function (icons) {
        this.setOptions('icons', icons);
    },

    getStylingFunction: function () {
        return this.getOptions('stylingFunction');
    },

    setStylingFunction: function (func) {
        this.setOptions('stylingFunction', func);
    },

    getDisableClickZoom: function () {
        return this.getOptions('disableClickZoom');
    },

    setDisableClickZoom: function (flag) {
        this.setOptions('disableClickZoom', flag);
    },

    getAverageCenter: function () {
        return this.getOptions('averageCenter');
    },

    setAverageCenter: function (averageCenter) {
        this.setOptions('averageCenter', averageCenter);
    },

    changed: function (key, value) {
        if (!this.getMap()) return;

        switch (key) {
            case 'marker':
            case 'minClusterSize':
            case 'gridSize':
            case 'averageCenter':
                this._redraw();
                break;
            case 'indexGenerator':
            case 'icons':
                this._clusters.forEach(function (cluster) {
                    cluster.updateIcon();
                });
                break;
            case 'maxZoom':
                this._clusters.forEach(function (cluster) {
                    if (cluster.getCount() > 1) {
                        cluster.checkByZoomAndMinClusterSize();
                    }
                });
                break;
            case 'stylingFunction':
                this._clusters.forEach(function (cluster) {
                    cluster.updateCount();
                });
                break;
            case 'disableClickZoom':
                var exec = 'enableClickZoom';

                if (value) {
                    exec = 'disableClickZoom';
                }

                this._clusters.forEach(function (cluster) {
                    cluster[exec]();
                });
                break;
        }
    },

    _createClusters: function () {
        var map = this.getMap();

        if (!map) return;

        var bounds = map.getBounds(),
            markers = this.getMarkers();

        for (var i = 0, ii = markers.length; i < ii; i++) {
            var marker = markers[i],
                position = marker.getPosition();

            if (!bounds.hasLatLng(position)) continue;

            var closestCluster = this._getClosestCluster(position);

            closestCluster.addMarker(marker);

            this._markerRelations.push(naver.maps.Event.addListener(marker, 'dragend', naver.maps.Util.bind(this._onDragEnd, this)));
        }
    },

    _updateClusters: function () {
        var clusters = this._clusters;

        for (var i = 0, ii = clusters.length; i < ii; i++) {
            clusters[i].updateCluster();
        }
    },

    _clearClusters: function () {
        var clusters = this._clusters;

        for (var i = 0, ii = clusters.length; i < ii; i++) {
            clusters[i].destroy();
        }

        naver.maps.Event.removeListener(this._markerRelations);

        this._markerRelations = [];
        this._clusters = [];
    },

    _redraw: function () {
        this._clearClusters();
        this._createClusters();
        this._updateClusters();
    },

    _getClosestCluster: function (position) {
        var proj = this.getProjection(),
            clusters = this._clusters,
            closestCluster = null,
            distance = Infinity;

        for (var i = 0, ii = clusters.length; i < ii; i++) {
            var cluster = clusters[i],
                center = cluster.getCenter();

            if (cluster.isInBounds(position)) {
                var delta = proj.getDistance(center, position);

                if (delta < distance) {
                    distance = delta;
                    closestCluster = cluster;
                }
            }
        }

        if (!closestCluster) {
            closestCluster = new Cluster(this);
            this._clusters.push(closestCluster);
        }

        return closestCluster;
    },

    _onIdle: function () {
        this._redraw();
    },

    _onDragEnd: function () {
        this._redraw();
    }
});

var Cluster = function (markerClusterer) {
    this._clusterCenter = null;
    this._clusterBounds = null;
    this._clusterMarker = null;
    this._relation = null;

    this._clusterMember = [];

    this._markerClusterer = markerClusterer;
};

Cluster.prototype = {
    constructor: Cluster,

    addMarker: function (marker) {
        if (this._isMember(marker)) return;

        if (!this._clusterCenter) {
            var position = marker.getPosition();

            this._clusterCenter = position;
            this._clusterBounds = this._calcBounds(position);
        }

        this._clusterMember.push(marker);
    },

    destroy: function () {
        naver.maps.Event.removeListener(this._relation);

        var members = this._clusterMember;

        for (var i = 0, ii = members.length; i < ii; i++) {
            members[i].setMap(null);
        }

        this._clusterMarker.setMap(null);

        this._clusterMarker = null;
        this._clusterCenter = null;
        this._clusterBounds = null;
        this._relation = null;

        this._clusterMember = [];
    },

    getCenter: function () {
        return this._clusterCenter;
    },

    getBounds: function () {
        return this._clusterBounds;
    },

    getCount: function () {
        return this._clusterMember.length;
    },

    getClusterMember: function () {
        return this._clusterMember;
    },

    isInBounds: function (latlng) {
        return this._clusterBounds && this._clusterBounds.hasLatLng(latlng);
    },

    enableClickZoom: function () {
        if (this._relation) return;

        var map = this._markerClusterer.getMap();

        this._relation = naver.maps.Event.addListener(this._clusterMarker, 'click', naver.maps.Util.bind(function (e) {
            map.morph(e.coord, map.getZoom() + 1);
        }, this));
    },

    disableClickZoom: function () {
        if (!this._relation) return;

        naver.maps.Event.removeListener(this._relation);
        this._relation = null;
    },

    updateCluster: function () {
        if (!this._clusterMarker) {
            var position;

            if (this._markerClusterer.getAverageCenter()) {
                position = this._calcAverageCenter(this._clusterMember);
            } else {
                position = this._clusterCenter;
            }

            this._clusterMarker = new naver.maps.Marker({
                position: position,
                map: this._markerClusterer.getMap()
            });

            if (!this._markerClusterer.getDisableClickZoom()) {
                this.enableClickZoom();
            }
        }

        this.updateIcon();
        this.updateCount();

        this.checkByZoomAndMinClusterSize();
    },

    checkByZoomAndMinClusterSize: function () {
        var clusterer = this._markerClusterer,
            minClusterSize = clusterer.getMinClusterSize(),
            maxZoom = clusterer.getMaxZoom(),
            currentZoom = clusterer.getMap().getZoom();

        if (this.getCount() < minClusterSize) {
            this._showMember();
        } else {
            this._hideMember();

            if (maxZoom <= currentZoom) {
                this._showMember();
            }
        }
    },

    updateCount: function () {
        var stylingFunction = this._markerClusterer.getStylingFunction();

        stylingFunction && stylingFunction(this._clusterMarker, this.getCount());
    },

    updateIcon: function () {
        var count = this.getCount(),
            index = this._getIndex(count),
            icons = this._markerClusterer.getIcons();

        index = Math.max(index, 0);
        index = Math.min(index, icons.length - 1);

        this._clusterMarker.setIcon(icons[index]);
    },

    _showMember: function () {
        var map = this._markerClusterer.getMap(),
            marker = this._clusterMarker,
            members = this._clusterMember;

        for (var i = 0, ii = members.length; i < ii; i++) {
            members[i].setMap(map);
        }

        if (marker) {
            marker.setMap(null);
        }
    },

    _hideMember: function () {
        var map = this._markerClusterer.getMap(),
            marker = this._clusterMarker,
            members = this._clusterMember;

        for (var i = 0, ii = members.length; i < ii; i++) {
            members[i].setMap(null);
        }

        if (marker && !marker.getMap()) {
            marker.setMap(map);
        }
    },

    _calcBounds: function (position) {
        var map = this._markerClusterer.getMap(),
            bounds = new naver.maps.LatLngBounds(position.clone(), position.clone()),
            mapBounds = map.getBounds(),
            proj = map.getProjection(),
            map_max_px = proj.fromCoordToOffset(mapBounds.getNE()),
            map_min_px = proj.fromCoordToOffset(mapBounds.getSW()),
            max_px = proj.fromCoordToOffset(bounds.getNE()),
            min_px = proj.fromCoordToOffset(bounds.getSW()),
            gridSize = this._markerClusterer.getGridSize() / 2;

        max_px.add(gridSize, -gridSize);
        min_px.add(-gridSize, gridSize);

        var max_px_x = Math.min(map_max_px.x, max_px.x),
            max_px_y = Math.max(map_max_px.y, max_px.y),
            min_px_x = Math.max(map_min_px.x, min_px.x),
            min_px_y = Math.min(map_min_px.y, min_px.y),
            newMax = proj.fromOffsetToCoord(new naver.maps.Point(max_px_x, max_px_y)),
            newMin = proj.fromOffsetToCoord(new naver.maps.Point(min_px_x, min_px_y));

        return new naver.maps.LatLngBounds(newMin, newMax);
    },

    _getIndex: function (count) {
        var indexGenerator = this._markerClusterer.getIndexGenerator();

        if (naver.maps.Util.isFunction(indexGenerator)) {
            return indexGenerator(count);
        } else if (naver.maps.Util.isArray(indexGenerator)) {
            var index = 0;

            for (var i = index, ii = indexGenerator.length; i < ii; i++) {
                var factor = indexGenerator[i];

                if (count < factor) break;

                index++;
            }

            return index;
        }
    },

    _isMember: function (marker) {
        return this._clusterMember.indexOf(marker) !== -1;
    },

    _calcAverageCenter: function (markers) {
        var numberOfMarkers = markers.length;
        var averageCenter = [0, 0];

        for (var i = 0; i < numberOfMarkers; i++) {
            averageCenter[0] += markers[i].position.x;
            averageCenter[1] += markers[i].position.y;
        }

        averageCenter[0] /= numberOfMarkers;
        averageCenter[1] /= numberOfMarkers;

        return new naver.maps.Point(averageCenter[0], averageCenter[1]);
    }

};