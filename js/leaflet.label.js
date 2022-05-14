!(function (e) {
  var t = e.L;
  (t.labelVersion = "0.2.2-dev"),
  (t.Label = t.Class.extend({
    includes: t.Mixin.Events,
    options: { className: "", clickable: !1, direction: "right", noHide: !1, offset: [12, -15], opacity: 1, zoomAnimation: !0 },
    initialize: function (e, i) {
      t.setOptions(this, e), (this._source = i), (this._animated = t.Browser.any3d && this.options.zoomAnimation), (this._isOpen = !1);
    },
    onAdd: function (e) {
      (this._map = e),
      (this._pane = this.options.pane ? e._panes[this.options.pane] : this._source instanceof t.Marker ? e._panes.markerPane : e._panes.popupPane),
      this._container || this._initLayout(),
      this._pane.appendChild(this._container),
      this._initInteraction(),
      this._update(),
      this.setOpacity(this.options.opacity),
      e.on("moveend", this._onMoveEnd, this).on("viewreset", this._onViewReset, this),
      this._animated && e.on("zoomanim", this._zoomAnimation, this),
      t.Browser.touch && !this.options.noHide && (t.DomEvent.on(this._container, "click", this.close, this), e.on("click", this.close, this));
    },
    onRemove: function (e) {
      this._pane.removeChild(this._container), e.off({ zoomanim: this._zoomAnimation, moveend: this._onMoveEnd, viewreset: this._onViewReset }, this), this._removeInteraction(), (this._map = null);
    },
    setLatLng: function (e) {
      return (this._latlng = t.latLng(e)), this._map && this._updatePosition(), this;
    },
    setContent: function (e) {
      return (this._previousContent = this._content), (this._content = e), this._updateContent(), this;
    },
    close: function () {
      var e = this._map;
      e && (t.Browser.touch && !this.options.noHide && (t.DomEvent.off(this._container, "click", this.close), e.off("click", this.close, this)), e.removeLayer(this));
    },
    updateZIndex: function (e) {
      (this._zIndex = e), this._container && this._zIndex && (this._container.style.zIndex = e);
    },
    setOpacity: function (e) {
      (this.options.opacity = e), this._container && t.DomUtil.setOpacity(this._container, e);
    },
    _initLayout: function () {
      (this._container = t.DomUtil.create("div", "leaflet-label " + this.options.className + " leaflet-zoom-animated")), this.updateZIndex(this._zIndex);
    },
    _update: function () {
      this._map && ((this._container.style.visibility = "hidden"), this._updateContent(), this._updatePosition(), (this._container.style.visibility = ""));
    },
    _updateContent: function () {
      this._content &&
      this._map &&
      this._prevContent !== this._content &&
      "string" == typeof this._content &&
      ((this._container.innerHTML = this._content), (this._prevContent = this._content), (this._labelWidth = this._container.offsetWidth));
    },
    _updatePosition: function () {
      var e = this._map.latLngToLayerPoint(this._latlng);
      this._setPosition(e);
    },
    _setPosition: function (e) {
      var i = this._map,
      r = this._container,
      o = i.latLngToContainerPoint(i.getCenter()),
      p = i.layerPointToContainerPoint(e),
      a = this.options.direction,
      y = this._labelWidth,
      s = t.point(this.options.offset);
      "right" === a || ("auto" === a && p.x < o.x)
      ? (t.DomUtil.addClass(r, "leaflet-label-right"), t.DomUtil.removeClass(r, "leaflet-label-left"), (e = e.add(s)))
      : (t.DomUtil.addClass(r, "leaflet-label-left"), t.DomUtil.removeClass(r, "leaflet-label-right"), (e = e.add(t.point(-s.x - y, s.y)))),
      t.DomUtil.setPosition(r, e);
    },
    _zoomAnimation: function (e) {
      var t = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center).round();
      this._setPosition(t);
    },
    _onMoveEnd: function () {
      (this._animated && "auto" !== this.options.direction) || this._updatePosition();
    },
    _onViewReset: function (e) {
      e && e.hard && this._update();
    },
    _initInteraction: function () {
      if (this.options.clickable) {
        var e = this._container,
        i = ["dblclick", "mousedown", "mouseover", "mouseout", "contextmenu"];
        t.DomUtil.addClass(e, "leaflet-clickable"), t.DomEvent.on(e, "click", this._onMouseClick, this);
        for (var r = 0; r < i.length; r++) t.DomEvent.on(e, i[r], this._fireMouseEvent, this);
      }
    },
    _removeInteraction: function () {
      if (this.options.clickable) {
        var e = this._container,
        i = ["dblclick", "mousedown", "mouseover", "mouseout", "contextmenu"];
        t.DomUtil.removeClass(e, "leaflet-clickable"), t.DomEvent.off(e, "click", this._onMouseClick, this);
        for (var r = 0; r < i.length; r++) t.DomEvent.off(e, i[r], this._fireMouseEvent, this);
      }
    },
    _onMouseClick: function (e) {
      this.hasEventListeners(e.type) && t.DomEvent.stopPropagation(e), this.fire(e.type, { originalEvent: e });
    },
    _fireMouseEvent: function (e) {
      this.fire(e.type, { originalEvent: e }), "contextmenu" === e.type && this.hasEventListeners(e.type) && t.DomEvent.preventDefault(e), "mousedown" !== e.type ? t.DomEvent.stopPropagation(e) : t.DomEvent.preventDefault(e);
    },
  })),
  (t.BaseMarkerMethods = {
    showLabel: function () {
      return this.label && this._map && (this.label.setLatLng(this._latlng), this._map.showLabel(this.label)), this;
    },
    hideLabel: function () {
      return this.label && this.label.close(), this;
    },
    setLabelNoHide: function (e) {
      this._labelNoHide !== e && ((this._labelNoHide = e), e ? (this._removeLabelRevealHandlers(), this.showLabel()) : (this._addLabelRevealHandlers(), this.hideLabel()));
    },
    bindLabel: function (e, i) {
      var r = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor,
      o = t.point(r) || t.point(0, 0);
      return (
        (o = o.add(t.Label.prototype.options.offset)),
        i && i.offset && (o = o.add(i.offset)),
        (i = t.Util.extend({ offset: o }, i)),
        (this._labelNoHide = i.noHide),
        this.label || (this._labelNoHide || this._addLabelRevealHandlers(), this.on("remove", this.hideLabel, this).on("move", this._moveLabel, this).on("add", this._onMarkerAdd, this), (this._hasLabelHandlers = !0)),
        (this.label = new t.Label(i, this).setContent(e)),
        this
        );
      },
      unbindLabel: function () {
        return (
          this.label &&
          (this.hideLabel(),
          (this.label = null),
          this._hasLabelHandlers && (this._labelNoHide || this._removeLabelRevealHandlers(), this.off("remove", this.hideLabel, this).off("move", this._moveLabel, this).off("add", this._onMarkerAdd, this)),
          (this._hasLabelHandlers = !1)),
          this
          );
        },
        updateLabelContent: function (e) {
          this.label && this.label.setContent(e);
        },
        getLabel: function () {
          return this.label;
        },
        _onMarkerAdd: function () {
          this._labelNoHide && this.showLabel();
        },
        _addLabelRevealHandlers: function () {
          this.on("mouseover", this.showLabel, this).on("mouseout", this.hideLabel, this), t.Browser.touch && this.on("click", this.showLabel, this);
        },
        _removeLabelRevealHandlers: function () {
          this.off("mouseover", this.showLabel, this).off("mouseout", this.hideLabel, this), t.Browser.touch && this.off("click", this.showLabel, this);
        },
        _moveLabel: function (e) {
          this.label.setLatLng(e.latlng);
        },
      }),
      t.Icon.Default.mergeOptions({ labelAnchor: new t.Point(9, -20) }),
      t.Marker.mergeOptions({ icon: new t.Icon.Default() }),
      t.Marker.include(t.BaseMarkerMethods),
      t.Marker.include({
        _originalUpdateZIndex: t.Marker.prototype._updateZIndex,
        _updateZIndex: function (e) {
          var t = this._zIndex + e;
          this._originalUpdateZIndex(e), this.label && this.label.updateZIndex(t);
        },
        _originalSetOpacity: t.Marker.prototype.setOpacity,
        setOpacity: function (e, t) {
          (this.options.labelHasSemiTransparency = t), this._originalSetOpacity(e);
        },
        _originalUpdateOpacity: t.Marker.prototype._updateOpacity,
        _updateOpacity: function () {
          var e = 0 === this.options.opacity ? 0 : 1;
          this._originalUpdateOpacity(), this.label && this.label.setOpacity(this.options.labelHasSemiTransparency ? this.options.opacity : e);
        },
        _originalSetLatLng: t.Marker.prototype.setLatLng,
        setLatLng: function (e) {
          return this.label && !this._labelNoHide && this.hideLabel(), this._originalSetLatLng(e);
        },
      }),
      t.CircleMarker.mergeOptions({ labelAnchor: new t.Point(0, 0) }),
      t.CircleMarker.include(t.BaseMarkerMethods),
      t.Path.include({
        bindLabel: function (e, i) {
          return (
            (this.label && this.label.options === i) || (this.label = new t.Label(i, this)),
            this.label.setContent(e),
            this._showLabelAdded ||
            (this.on("mouseover", this._showLabel, this).on("mousemove", this._moveLabel, this).on("mouseout remove", this._hideLabel, this),
            t.Browser.touch && this.on("click", this._showLabel, this),
            (this._showLabelAdded = !0)),
            this
            );
          },
          unbindLabel: function () {
            return (
              this.label && (this._hideLabel(), (this.label = null), (this._showLabelAdded = !1), this.off("mouseover", this._showLabel, this).off("mousemove", this._moveLabel, this).off("mouseout remove", this._hideLabel, this)),
              this
              );
            },
            updateLabelContent: function (e) {
              this.label && this.label.setContent(e);
            },
            _showLabel: function (e) {
              this.label.setLatLng(e.latlng), this._map.showLabel(this.label);
            },
            _moveLabel: function (e) {
              this.label.setLatLng(e.latlng);
            },
            _hideLabel: function () {
              this.label.close();
            },
          }),
          t.Map.include({
            showLabel: function (e) {
              return this.addLayer(e);
            },
          }),
          t.FeatureGroup.include({
            clearLayers: function () {
              return this.unbindLabel(), this.eachLayer(this.removeLayer, this), this;
            },
            bindLabel: function (e, t) {
              return this.invoke("bindLabel", e, t);
            },
            unbindLabel: function () {
              return this.invoke("unbindLabel");
            },
            updateLabelContent: function (e) {
              this.invoke("updateLabelContent", e);
            },
          });
        })(window, document);