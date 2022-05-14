const Map = {
  
  map: {},
  layers: {},
  layerControl: {},
  legendControl: {},
  
  init: function (e) {
    // Eliminare?
    if (e){
      L.mapbox.accessToken = e;
    }

    $("#map").html("");
    
    this.map = L.mapbox.map("map", !1, {
      maxZoom: 14,
      minZoom: 8
    });
    this.map.setView( [39.9182, 64.281], 10 );
      
    this.layers = {
      base: { 
        "Open Street Map": L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png"), 
        "Google Satellite": new L.Google(), 
        "Google Roadmap": new L.Google("ROADMAP") 
      },
      overlays: { 
        "Carte régionale 1893": L.tileLayer("./bukhara-base/{z}/{x}/{y}.png").addTo(this.map)
      },
    };
      
    this.addLayerControl();
      
    this.map.scrollWheelZoom.disable();
      
    L.control.fullscreen().addTo(this.map);
      
    var t = this;
      
    return (
      this.map.on("fullscreenchange", function () {
        t.map.isFullscreen() ? 
          t.map.scrollWheelZoom.enable() : 
          t.opts.scrollWheelZoom || t.map.scrollWheelZoom.disable();
      }),
      this.map.addLayer(this.layers.base["Google Satellite"]),
      this.loadSites({ show: !0, name: "Tous les sites (Rante 2015)" }),
      this.loadPop(),
      this.addLayerControl(),
      this.addSiteLegend(),
      this.map.on("overlayadd", function (e) {
        t.updateLegend(e.name, "add"), t.addLayerControl(), t.addSiteLegend();
      }),
      this
    );
  },
      
  loadPop: function () {
    const district_cols = {
      "Khayrabad"     : "#c80000",
      "Shimali-yi Rud": "#c8c800",
      "Samjan"        : "#c8c8c8",
      "Kamat"         : "#640000",
      "Kam-i Abu Muslim": "#646400",
      "Kharqan Rud"   : "#646464",
      "Pirmast, Nahr-i Sultanabad": "#320000",
      "Shafurkam"     : "#323200",
      "Khitfar"       : "#323232",
      "Pirmast"       : "#dd33df",
    };
    var e = L.geoJson(population, {
      pointToLayer: function (e, t) {
        return new L.CircleMarker(t, {
          radius: 5,
          fillColor: district_cols[e.properties.district],
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function (e, t) {
        t.bindLabel("District: " + e.properties.district);
      },
    });
    this.layers.overlays["Aires administratives (&copy;Schwarz 2014)"] = e;
  },

  updateLegend: function (e, t) {
    var i = this;
    switch (e) {
      case "Tous les sites (Rante 2015)":
      "add" === t &&
      $.each(["Citadelle et Shahrestan", "Citadelle, Shahrestan et Rabad", "Aires administratives (&copy;Schwarz 2014)"], function (e, t) {
        i.map.hasLayer(i.layers.overlays[t]) && i.map.removeLayer(i.layers.overlays[t]);
      });
      break;
      case "Citadelle et Shahrestan":
      case "Citadelle, Shahrestan et Rabad":
      "add" === t &&
      $.each(["Tous les sites (Rante 2015)", "Aires administratives (&copy;Schwarz 2014)"], function (e, t) {
        i.map.hasLayer(i.layers.overlays[t]) && i.map.removeLayer(i.layers.overlays[t]);
      });
      break;
      case "Aires administratives (&copy;Schwarz 2014)":
      $.each(["Citadelle et Shahrestan", "Citadelle, Shahrestan et Rabad", "Tous les sites (Rante 2015)"], function (e, t) {
        i.map.hasLayer(i.layers.overlays[t]) && i.map.removeLayer(i.layers.overlays[t]);
      });
    }
  },
  loadSites: function (e) {
    var t = L.geoJson(sites, {
      filter: function (t) {
        return e.type ? t.properties.type === e.type : !0;
      },
      pointToLayer: function (t, i) {
        if (!e.type) return new L.CircleMarker(i, {
          radius: 5, 
          fillColor: "#e0930e", 
          color: "#000", 
          weight: 1, 
          opacity: 1, 
          fillOpacity: 0.9
        });
        
        var r;
        
        switch (t.properties.type) {
          case "Citadelle, Shahrestan et Rabad":
            r = "#cf0606";
            break;
          case "Citadelle et Shahrestan":
            r = "#1c0e8a";
        }
        return new L.CircleMarker(i, {
          radius: 5, 
          fillColor: r, 
          color: "#000", 
          weight: 1, 
          opacity: 1, 
          fillOpacity: 0.9 
        });
      },
      onEachFeature: function (f, t) {
        t.bindPopup(`Site: <strong>${f.properties.siteid}</strong>${
          site_galleries[f.properties.siteid] && `<p> ${site_galleries[f.properties.siteid].items.map( (e, i) => {
            return `<a 
                href="./img/galleries/${site_galleries[f.properties.siteid].name}/${e}.jpg" 
                class="fancybox" 
                ${i > 0 && `style="display:none" `}
                data-caption="${site_galleries[f.properties.siteid].name} #${i+1}"
                rel="${site_galleries[f.properties.siteid].name}" 
                data-fancybox="${site_galleries[f.properties.siteid].name}">
                  Galerie de photos
                </a>`
          }).join('')}</p>`
        }`).bindLabel(f.properties.siteid);
      },
    });
    e.show && t.addTo(this.map), (this.layers.overlays[e.name] = t);
  },
  addLayerControl: function () {
    Object.getOwnPropertyNames(this.layerControl).length > 0 && this.map.removeControl(this.layerControl), (this.layerControl = L.control.layers(this.layers.base, this.layers.overlays, { collapsed: !1 }).addTo(this.map));
  },
  addSiteLegend: function () {
    ($this = this),
    Object.getOwnPropertyNames(this.legendControl).length > 0 && this.map.removeControl(this.legendControl),
    (this.legendControl = L.control({ position: "bottomright" })),
    (this.legendControl.onAdd = function () {
      var e = L.DomUtil.create("div", "info legend");
      return (
        (e.innerHTML =
          '<div class="legend-title">Mission Archéologique Franco-Ouzbèke<br>dans l\'Oasis de Boukhara<br>(Musée du Louvre)<br>Etude GIS dirigée par Rocco Rante</div><div class="legend-source">&copy; Musée du Louvre. All rights reserved</div>'),
          ($this.map.hasLayer($this.layers.overlays["Citadelle et Shahrestan"]) || $this.map.hasLayer($this.layers.overlays["Citadelle, Shahrestan et Rabad"])) &&
          (e.innerHTML += '<div class="legend-scale"><ul class="legend-labels"><li><span style="background:#cf0606;"></span>Citadelle et Shahrestan et Rabad</li></ul></div>'),
          $this.map.hasLayer($this.layers.overlays["Carte régionale 1893"]),
          e
        );
    }),
    this.legendControl.addTo(this.map);
  },
};
        
        
$(document).ready(function () {
  Map.init();
});