(L.Google = L.Class.extend({
  includes: L.Mixin.Events,
  options: { minZoom: 0, maxZoom: 18, tileSize: 256, subdomains: "abc", errorTileUrl: "", attribution: "", opacity: 1, continuousWorld: !1, noWrap: !1, mapOptions: { backgroundColor: "#dddddd" } },
  initialize: function (e, t) {
    L.Util.setOptions(this, t), (this._ready = void 0 !== google.maps.Map), this._ready || L.Google.asyncWait.push(this), (this._type = e || "SATELLITE");
  },
  onAdd: function (e, t) {
    (this._map = e),
    (this._insertAtTheBottom = t),
    this._initContainer(),
    this._initMapObject(),
    e.on("viewreset", this._resetCallback, this),
    (this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this)),
    e.on("move", this._update, this),
    e.on("zoomanim", this._handleZoomAnim, this),
    (e._controlCorners.bottomright.style.marginBottom = "20px"),
    this._reset(),
    this._update();
  },
  onRemove: function (e) {
    e._container.removeChild(this._container), e.off("viewreset", this._resetCallback, this), e.off("move", this._update, this), e.off("zoomanim", this._handleZoomAnim, this), (e._controlCorners.bottomright.style.marginBottom = "0em");
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  setOpacity: function (e) {
    (this.options.opacity = e), 1 > e && L.DomUtil.setOpacity(this._container, e);
  },
  setElementSize: function (e, t) {
    (e.style.width = t.x + "px"), (e.style.height = t.y + "px");
  },
  _initContainer: function () {
    var e = this._map._container,
    t = e.firstChild;
    this._container || ((this._container = L.DomUtil.create("div", "leaflet-google-layer leaflet-top leaflet-left")), (this._container.id = "_GMapContainer_" + L.Util.stamp(this)), (this._container.style.zIndex = "auto")),
    e.insertBefore(this._container, t),
    this.setOpacity(this.options.opacity),
    this.setElementSize(this._container, this._map.getSize());
  },
  _initMapObject: function () {
    if (this._ready) {
      this._google_center = new google.maps.LatLng(0, 0);
      var e = new google.maps.Map(this._container, {
        center: this._google_center,
        zoom: 0,
        tilt: 0,
        mapTypeId: google.maps.MapTypeId[this._type],
        disableDefaultUI: !0,
        keyboardShortcuts: !1,
        draggable: !1,
        disableDoubleClickZoom: !0,
        scrollwheel: !1,
        streetViewControl: !1,
        styles: this.options.mapOptions.styles,
        backgroundColor: this.options.mapOptions.backgroundColor,
      }),
      t = this;
      (this._reposition = google.maps.event.addListenerOnce(e, "center_changed", function () {
        t.onReposition();
      })),
      (this._google = e),
      google.maps.event.addListenerOnce(e, "idle", function () {
        t._checkZoomLevels();
      }),
      this.fire("MapObjectInitialized", { mapObject: e });
    }
  },
  _checkZoomLevels: function () {
    this._google.getZoom() !== this._map.getZoom() && this._map.setZoom(this._google.getZoom());
  },
  _resetCallback: function (e) {
    this._reset(e.hard);
  },
  _reset: function () {
    this._initContainer();
  },
  _update: function () {
    if (this._google) {
      this._resize();
      var e = this._map.getCenter(),
      t = new google.maps.LatLng(e.lat, e.lng);
      this._google.setCenter(t), this._google.setZoom(Math.round(this._map.getZoom())), this._checkZoomLevels();
    }
  },
  _resize: function () {
    var e = this._map.getSize();
    (this._container.style.width !== e.x || this._container.style.height !== e.y) && (this.setElementSize(this._container, e), this.onReposition());
  },
  _handleZoomAnim: function (e) {
    var t = e.center,
    i = new google.maps.LatLng(t.lat, t.lng);
    this._google.setCenter(i), this._google.setZoom(Math.round(e.zoom));
  },
  onReposition: function () {
    this._google && google.maps.event.trigger(this._google, "resize");
  },
})),
(L.Google.asyncWait = []),
(L.Google.asyncInitialize = function () {
  var e;
  for (e = 0; e < L.Google.asyncWait.length; e++) {
    var t = L.Google.asyncWait[e];
    (t._ready = !0), t._container && (t._initMapObject(), t._update());
  }
  L.Google.asyncWait = [];
});