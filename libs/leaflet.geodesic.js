/*! leaflet.geodesic 2.7.1 - (c) Henry Thasler - https://github.com/henrythasler/Leaflet.Geodesic#readme */
!(function (t, n) {
  "object" == typeof exports && "undefined" != typeof module
    ? n(exports, require("leaflet"))
    : "function" == typeof define && define.amd
    ? define(["exports", "leaflet"], n)
    : n(
        (((t = "undefined" != typeof globalThis ? globalThis : t || self).L =
          t.L || {}),
        (t.L.geodesic = {})),
        t.L
      );
})(this, function (t, n) {
  "use strict";
  function e(t) {
    var n = Object.create(null);
    return (
      t &&
        Object.keys(t).forEach(function (e) {
          if ("default" !== e) {
            var i = Object.getOwnPropertyDescriptor(t, e);
            Object.defineProperty(
              n,
              e,
              i.get
                ? i
                : {
                    enumerable: !0,
                    get: function () {
                      return t[e];
                    },
                  }
            );
          }
        }),
      (n.default = t),
      Object.freeze(n)
    );
  }
  var i = e(n),
    a = function (t, n) {
      return (
        (a =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (t, n) {
              t.__proto__ = n;
            }) ||
          function (t, n) {
            for (var e in n)
              Object.prototype.hasOwnProperty.call(n, e) && (t[e] = n[e]);
          }),
        a(t, n)
      );
    };
  function o(t, n) {
    if ("function" != typeof n && null !== n)
      throw new TypeError(
        "Class extends value " + String(n) + " is not a constructor or null"
      );
    function e() {
      this.constructor = t;
    }
    a(t, n),
      (t.prototype =
        null === n ? Object.create(n) : ((e.prototype = n.prototype), new e()));
  }
  var s = function () {
    return (
      (s =
        Object.assign ||
        function (t) {
          for (var n, e = 1, i = arguments.length; e < i; e++)
            for (var a in (n = arguments[e]))
              Object.prototype.hasOwnProperty.call(n, a) && (t[a] = n[a]);
          return t;
        }),
      s.apply(this, arguments)
    );
  };
  function r(t, n, e) {
    if (e || 2 === arguments.length)
      for (var i, a = 0, o = n.length; a < o; a++)
        (!i && a in n) ||
          (i || (i = Array.prototype.slice.call(n, 0, a)), (i[a] = n[a]));
    return t.concat(i || Array.prototype.slice.call(n));
  }
  "function" == typeof SuppressedError && SuppressedError;
  var l = (function () {
      function t(t) {
        (this.options = { wrap: !0, steps: 3 }),
          (this.ellipsoid = {
            a: 6378137,
            b: 6356752.3142,
            f: 1 / 298.257223563,
          }),
          (this.options = s(s({}, this.options), t));
      }
      return (
        (t.prototype.toRadians = function (t) {
          return (t * Math.PI) / 180;
        }),
        (t.prototype.toDegrees = function (t) {
          return (180 * t) / Math.PI;
        }),
        (t.prototype.mod = function (t, n) {
          var e = t % n;
          return e < 0 ? e + n : e;
        }),
        (t.prototype.wrap360 = function (t) {
          return 0 <= t && t < 360 ? t : this.mod(t, 360);
        }),
        (t.prototype.wrap = function (t, n) {
          return (
            void 0 === n && (n = 360),
            -n <= t && t <= n ? t : this.mod(t + n, 2 * n) - n
          );
        }),
        (t.prototype.direct = function (t, n, e, i) {
          void 0 === i && (i = 100);
          var a = this.toRadians(t.lat),
            o = this.toRadians(t.lng),
            s = this.toRadians(n),
            r = e,
            l = 1e3 * Number.EPSILON,
            c = this.ellipsoid,
            h = c.a,
            p = c.b,
            u = c.f,
            g = Math.sin(s),
            f = Math.cos(s),
            d = (1 - u) * Math.tan(a),
            L = 1 / Math.sqrt(1 + d * d),
            M = d * L,
            y = Math.atan2(d, f),
            v = L * g,
            w = 1 - v * v,
            m = (w * (h * h - p * p)) / (p * p),
            b = 1 + (m / 16384) * (4096 + m * (m * (320 - 175 * m) - 768)),
            O = (m / 1024) * (256 + m * (m * (74 - 47 * m) - 128)),
            S = r / (p * b),
            D = null,
            E = null,
            P = null,
            R = null,
            x = 0;
          do {
            (P = Math.cos(2 * y + S)),
              (R = S),
              (S =
                r / (p * b) +
                O *
                  (D = Math.sin(S)) *
                  (P +
                    (O / 4) *
                      ((E = Math.cos(S)) * (2 * P * P - 1) -
                        (O / 6) * P * (4 * D * D - 3) * (4 * P * P - 3))));
          } while (Math.abs(S - R) > l && ++x < i);
          if (x >= i)
            throw new EvalError(
              "Direct vincenty formula failed to converge after "
                .concat(i, " iterations \n                (start=")
                .concat(t.lat, "/")
                .concat(t.lng, "; bearing=")
                .concat(n, "; distance=")
                .concat(e, ")")
            );
          var G = M * D - L * E * f,
            j = Math.atan2(
              M * E + L * D * f,
              (1 - u) * Math.sqrt(v * v + G * G)
            ),
            N = (u / 16) * w * (4 + u * (4 - 3 * w)),
            A =
              o +
              (Math.atan2(D * g, L * E - M * D * f) -
                (1 - N) * u * v * (S + N * D * (P + N * E * (2 * P * P - 1)))),
            T = Math.atan2(v, -G);
          return {
            lat: this.toDegrees(j),
            lng: this.toDegrees(A),
            bearing: this.wrap360(this.toDegrees(T)),
          };
        }),
        (t.prototype.inverse = function (t, n, e, a) {
          void 0 === e && (e = 100), void 0 === a && (a = !0);
          var o = t,
            s = n,
            r = this.toRadians(o.lat),
            l = this.toRadians(o.lng),
            c = this.toRadians(s.lat),
            h = this.toRadians(s.lng),
            p = Math.PI,
            u = Number.EPSILON,
            g = this.ellipsoid,
            f = g.a,
            d = g.b,
            L = g.f,
            M = h - l,
            y = (1 - L) * Math.tan(r),
            v = 1 / Math.sqrt(1 + y * y),
            w = y * v,
            m = (1 - L) * Math.tan(c),
            b = 1 / Math.sqrt(1 + m * m),
            O = m * b,
            S = Math.abs(M) > p / 2 || Math.abs(c - r) > p / 2,
            D = M,
            E = null,
            P = null,
            R = S ? p : 0,
            x = 0,
            G = S ? -1 : 1,
            j = null,
            N = 1,
            A = null,
            T = 1,
            q = null,
            C = null,
            I = 0;
          do {
            if (
              ((j =
                b * (E = Math.sin(D)) * (b * E) +
                (v * O - w * b * (P = Math.cos(D))) * (v * O - w * b * P)),
              Math.abs(j) < u)
            )
              break;
            if (
              ((G = w * O + v * b * P),
              (C = D),
              (D =
                M +
                (1 -
                  (q =
                    (L / 16) *
                    (T = 1 - (A = (v * b * E) / (x = Math.sqrt(j))) * A) *
                    (4 + L * (4 - 3 * T)))) *
                  L *
                  A *
                  ((R = Math.atan2(x, G)) +
                    q *
                      x *
                      ((N = 0 !== T ? G - (2 * w * O) / T : 0) +
                        q * G * (2 * N * N - 1)))),
              (S ? Math.abs(D) - p : Math.abs(D)) > p)
            )
              throw new EvalError("λ > π");
          } while (Math.abs(D - C) > 1e-12 && ++I < e);
          if (I >= e) {
            if (a)
              return this.inverse(t, new i.LatLng(n.lat, n.lng - 0.01), e, a);
            throw new EvalError(
              "Inverse vincenty formula failed to converge after "
                .concat(e, " iterations \n                    (start=")
                .concat(t.lat, "/")
                .concat(t.lng, "; dest=")
                .concat(n.lat, "/")
                .concat(n.lng, ")")
            );
          }
          var _ = (T * (f * f - d * d)) / (d * d),
            k = (_ / 1024) * (256 + _ * (_ * (74 - 47 * _) - 128)),
            B =
              d *
              (1 + (_ / 16384) * (4096 + _ * (_ * (320 - 175 * _) - 768))) *
              (R -
                k *
                  x *
                  (N +
                    (k / 4) *
                      (G * (2 * N * N - 1) -
                        (k / 6) * N * (4 * x * x - 3) * (4 * N * N - 3)))),
            J = Math.abs(j) < u ? 0 : Math.atan2(b * E, v * O - w * b * P),
            U = Math.abs(j) < u ? p : Math.atan2(v * E, -w * b + v * O * P);
          return {
            distance: B,
            initialBearing:
              Math.abs(B) < u ? NaN : this.wrap360(this.toDegrees(J)),
            finalBearing:
              Math.abs(B) < u ? NaN : this.wrap360(this.toDegrees(U)),
          };
        }),
        (t.prototype.intersection = function (t, n, e, a) {
          var o = this.toRadians(t.lat),
            s = this.toRadians(t.lng),
            r = this.toRadians(e.lat),
            l = this.toRadians(e.lng),
            c = this.toRadians(n),
            h = this.toRadians(a),
            p = r - o,
            u = l - s,
            g = Math.PI,
            f = Number.EPSILON,
            d =
              2 *
              Math.asin(
                Math.sqrt(
                  Math.sin(p / 2) * Math.sin(p / 2) +
                    Math.cos(o) *
                      Math.cos(r) *
                      Math.sin(u / 2) *
                      Math.sin(u / 2)
                )
              );
          if (Math.abs(d) < f) return t;
          var L =
              (Math.sin(r) - Math.sin(o) * Math.cos(d)) /
              (Math.sin(d) * Math.cos(o)),
            M =
              (Math.sin(o) - Math.sin(r) * Math.cos(d)) /
              (Math.sin(d) * Math.cos(r)),
            y = Math.acos(Math.min(Math.max(L, -1), 1)),
            v = Math.acos(Math.min(Math.max(M, -1), 1)),
            w = c - (Math.sin(l - s) > 0 ? y : 2 * g - y),
            m = (Math.sin(l - s) > 0 ? 2 * g - v : v) - h;
          if (0 === Math.sin(w) && 0 === Math.sin(m)) return null;
          if (Math.sin(w) * Math.sin(m) < 0) return null;
          var b =
              -Math.cos(w) * Math.cos(m) +
              Math.sin(w) * Math.sin(m) * Math.cos(d),
            O = Math.atan2(
              Math.sin(d) * Math.sin(w) * Math.sin(m),
              Math.cos(m) + Math.cos(w) * b
            ),
            S = Math.asin(
              Math.min(
                Math.max(
                  Math.sin(o) * Math.cos(O) +
                    Math.cos(o) * Math.sin(O) * Math.cos(c),
                  -1
                ),
                1
              )
            ),
            D =
              s +
              Math.atan2(
                Math.sin(c) * Math.sin(O) * Math.cos(o),
                Math.cos(O) - Math.sin(o) * Math.sin(S)
              );
          return new i.LatLng(this.toDegrees(S), this.toDegrees(D));
        }),
        (t.prototype.midpoint = function (t, n) {
          var e = this.toRadians(t.lat),
            a = this.toRadians(t.lng),
            o = this.toRadians(n.lat),
            s = this.toRadians(n.lng - t.lng),
            r = Math.cos(e),
            l = 0,
            c = Math.sin(e),
            h = {
              x: r + Math.cos(o) * Math.cos(s),
              y: l + Math.cos(o) * Math.sin(s),
              z: c + Math.sin(o),
            },
            p = Math.atan2(h.z, Math.sqrt(h.x * h.x + h.y * h.y)),
            u = a + Math.atan2(h.y, h.x);
          return new i.LatLng(this.toDegrees(p), this.toDegrees(u));
        }),
        t
      );
    })(),
    c = (function () {
      function t(t) {
        var n;
        (this.geodesic = new l()),
          (this.steps =
            null !== (n = null == t ? void 0 : t.steps) && void 0 !== n
              ? n
              : 3);
      }
      return (
        (t.prototype.recursiveMidpoint = function (t, n, e) {
          var i = [t, n],
            a = this.geodesic.midpoint(t, n);
          return (
            e > 0
              ? (i.splice.apply(
                  i,
                  r([0, 1], this.recursiveMidpoint(t, a, e - 1), !1)
                ),
                i.splice.apply(
                  i,
                  r([i.length - 2, 2], this.recursiveMidpoint(a, n, e - 1), !1)
                ))
              : i.splice(1, 0, a),
            i
          );
        }),
        (t.prototype.line = function (t, n) {
          return this.recursiveMidpoint(t, n, Math.min(8, this.steps));
        }),
        (t.prototype.multiLineString = function (t) {
          for (var n = [], e = 0, i = t; e < i.length; e++) {
            for (var a = i[e], o = [], s = 1; s < a.length; s++)
              o.splice.apply(
                o,
                r([o.length - 1, 1], this.line(a[s - 1], a[s]), !1)
              );
            n.push(o);
          }
          return n;
        }),
        (t.prototype.lineString = function (t) {
          return this.multiLineString([t])[0];
        }),
        (t.prototype.splitLine = function (t, n) {
          var e = { point: new i.LatLng(89.9, -180.0000001), bearing: 180 },
            a = { point: new i.LatLng(89.9, 180.0000001), bearing: 180 },
            o = new i.LatLng(t.lat, t.lng, t.alt),
            s = new i.LatLng(n.lat, n.lng, n.alt);
          (o.lng = this.geodesic.wrap(o.lng, 360)),
            (s.lng = this.geodesic.wrap(s.lng, 360)),
            s.lng - o.lng > 180
              ? (s.lng = s.lng - 360)
              : s.lng - o.lng < -180 && (s.lng = s.lng + 360);
          var r = [
            [
              new i.LatLng(o.lat, this.geodesic.wrap(o.lng, 180), o.alt),
              new i.LatLng(s.lat, this.geodesic.wrap(s.lng, 180), s.alt),
            ],
          ];
          if (o.lng >= -180 && o.lng <= 180) {
            if (s.lng < -180) {
              var l = this.geodesic.inverse(o, s).initialBearing;
              (c = this.geodesic.intersection(o, l, e.point, e.bearing)) &&
                (r = [
                  [o, c],
                  [
                    new i.LatLng(c.lat, c.lng + 360),
                    new i.LatLng(s.lat, s.lng + 360, s.alt),
                  ],
                ]);
            } else if (s.lng > 180) {
              l = this.geodesic.inverse(o, s).initialBearing;
              (c = this.geodesic.intersection(o, l, a.point, a.bearing)) &&
                (r = [
                  [o, c],
                  [
                    new i.LatLng(c.lat, c.lng - 360),
                    new i.LatLng(s.lat, s.lng - 360, s.alt),
                  ],
                ]);
            }
          } else if (s.lng >= -180 && s.lng <= 180)
            if (o.lng < -180) {
              l = this.geodesic.inverse(o, s).initialBearing;
              (c = this.geodesic.intersection(o, l, e.point, e.bearing)) &&
                (r = [
                  [
                    new i.LatLng(o.lat, o.lng + 360, o.alt),
                    new i.LatLng(c.lat, c.lng + 360),
                  ],
                  [c, s],
                ]);
            } else if (o.lng > 180) {
              var c;
              l = this.geodesic.inverse(o, s).initialBearing;
              (c = this.geodesic.intersection(o, l, e.point, e.bearing)) &&
                (r = [
                  [
                    new i.LatLng(o.lat, o.lng - 360, o.alt),
                    new i.LatLng(c.lat, c.lng - 360),
                  ],
                  [c, s],
                ]);
            }
          return r;
        }),
        (t.prototype.splitMultiLineString = function (t) {
          for (var n = [], e = 0, i = t; e < i.length; e++) {
            var a = i[e];
            if (1 !== a.length) {
              for (var o = [], s = 1; s < a.length; s++) {
                var r = this.splitLine(a[s - 1], a[s]);
                o.pop(),
                  (o = o.concat(r[0])),
                  r.length > 1 && (n.push(o), (o = r[1]));
              }
              n.push(o);
            } else n.push(a);
          }
          return n;
        }),
        (t.prototype.wrapMultiLineString = function (t) {
          for (var n = [], e = 0, a = t; e < a.length; e++) {
            for (var o = [], s = null, r = 0, l = a[e]; r < l.length; r++) {
              var c = l[r];
              if (null === s)
                o.push(new i.LatLng(c.lat, c.lng)),
                  (s = new i.LatLng(c.lat, c.lng));
              else {
                var h = Math.round((c.lng - s.lng) / 360);
                o.push(new i.LatLng(c.lat, c.lng - 360 * h)),
                  (s = new i.LatLng(c.lat, c.lng - 360 * h));
              }
            }
            n.push(o);
          }
          return n;
        }),
        (t.prototype.circle = function (t, n) {
          for (var e = [], a = 0; a < this.steps; a++) {
            var o = this.geodesic.direct(t, (360 / this.steps) * a, n);
            e.push(new i.LatLng(o.lat, o.lng));
          }
          return e.push(new i.LatLng(e[0].lat, e[0].lng)), e;
        }),
        (t.prototype.splitCircle = function (t) {
          var n = this.splitMultiLineString([t]);
          return (
            3 === n.length &&
              ((n[2] = r(r([], n[2], !0), n[0], !0)), n.shift()),
            n
          );
        }),
        (t.prototype.distance = function (t, n) {
          return this.geodesic.inverse(
            new i.LatLng(t.lat, this.geodesic.wrap(t.lng, 180)),
            new i.LatLng(n.lat, this.geodesic.wrap(n.lng, 180))
          ).distance;
        }),
        (t.prototype.multilineDistance = function (t) {
          for (var n = [], e = 0, i = t; e < i.length; e++) {
            for (var a = i[e], o = 0, s = 1; s < a.length; s++)
              o += this.distance(a[s - 1], a[s]);
            n.push(o);
          }
          return n;
        }),
        (t.prototype.updateStatistics = function (t, n) {
          var e = {
            distanceArray: [],
            totalDistance: 0,
            points: 0,
            vertices: 0,
          };
          (e.distanceArray = this.multilineDistance(t)),
            (e.totalDistance = e.distanceArray.reduce(function (t, n) {
              return t + n;
            }, 0)),
            (e.points = 0);
          for (var i = 0, a = t; i < a.length; i++) {
            var o = a[i];
            e.points += o.reduce(function (t) {
              return t + 1;
            }, 0);
          }
          e.vertices = 0;
          for (var s = 0, r = n; s < r.length; s++) {
            o = r[s];
            e.vertices += o.reduce(function (t) {
              return t + 1;
            }, 0);
          }
          return e;
        }),
        t
      );
    })();
  function h(t) {
    return (
      "object" == typeof t &&
      null !== t &&
      "lat" in t &&
      "lng" in t &&
      "number" == typeof t.lat &&
      "number" == typeof t.lng
    );
  }
  function p(t) {
    return (
      t instanceof Array && "number" == typeof t[0] && "number" == typeof t[1]
    );
  }
  function u(t) {
    return t instanceof i.LatLng || p(t) || h(t);
  }
  function g(t) {
    if (t instanceof i.LatLng) return t;
    if (p(t)) return new i.LatLng(t[0], t[1], t.at(2));
    if (h(t)) return new i.LatLng(t.lat, t.lng, t.alt);
    throw new Error("L.LatLngExpression expected. Unknown object found.");
  }
  var f = (function (t) {
      function n(n, e) {
        var a = t.call(this, [], e) || this;
        return (
          (a.defaultOptions = { wrap: !0, steps: 3 }),
          (a.statistics = {
            distanceArray: [],
            totalDistance: 0,
            points: 0,
            vertices: 0,
          }),
          (a.points = []),
          i.Util.setOptions(a, s(s({}, a.defaultOptions), e)),
          (a.geom = new c(a.options)),
          void 0 !== n && a.setLatLngs(n),
          a
        );
      }
      return (
        o(n, t),
        (n.prototype.updateGeometry = function () {
          var n;
          if (
            ((n = this.geom.multiLineString(this.points)),
            (this.statistics = this.geom.updateStatistics(this.points, n)),
            this.options.wrap)
          ) {
            var e = this.geom.splitMultiLineString(n);
            t.prototype.setLatLngs.call(this, e);
          } else
            t.prototype.setLatLngs.call(this, this.geom.wrapMultiLineString(n));
        }),
        (n.prototype.setLatLngs = function (t) {
          return (
            (this.points = (function (t) {
              var n = [],
                e = u(t[0]) ? [t] : t,
                i = new Error(
                  "L.LatLngExpression[] | L.LatLngExpression[][] expected. Unknown object found."
                );
              if (!(e instanceof Array)) throw i;
              for (var a = 0, o = e; a < o.length; a++) {
                var s = o[a];
                if (!(s instanceof Array)) throw i;
                for (var r = [], l = 0, c = s; l < c.length; l++) {
                  var h = c[l];
                  if (!u(h)) throw i;
                  r.push(g(h));
                }
                n.push(r);
              }
              return n;
            })(t)),
            this.updateGeometry(),
            this
          );
        }),
        (n.prototype.addLatLng = function (t, n) {
          var e = g(t);
          return (
            0 === this.points.length
              ? this.points.push([e])
              : void 0 === n
              ? this.points[this.points.length - 1].push(e)
              : n.push(e),
            this.updateGeometry(),
            this
          );
        }),
        (n.prototype.fromGeoJson = function (t) {
          var n = [],
            e = [];
          return (
            "FeatureCollection" === t.type
              ? (e = t.features)
              : "Feature" === t.type
              ? (e = [t])
              : [
                  "MultiPoint",
                  "LineString",
                  "MultiLineString",
                  "Polygon",
                  "MultiPolygon",
                ].includes(t.type)
              ? (e = [{ type: "Feature", geometry: t, properties: {} }])
              : console.log(
                  '[Leaflet.Geodesic] fromGeoJson() - Type "'.concat(
                    t.type,
                    '" not supported.'
                  )
                ),
            e.forEach(function (t) {
              switch (t.geometry.type) {
                case "MultiPoint":
                case "LineString":
                  n = r(
                    r([], n, !0),
                    [i.GeoJSON.coordsToLatLngs(t.geometry.coordinates, 0)],
                    !1
                  );
                  break;
                case "MultiLineString":
                case "Polygon":
                  n = r(
                    r([], n, !0),
                    i.GeoJSON.coordsToLatLngs(t.geometry.coordinates, 1),
                    !0
                  );
                  break;
                case "MultiPolygon":
                  t.geometry.coordinates.forEach(function (t) {
                    n = r(r([], n, !0), i.GeoJSON.coordsToLatLngs(t, 1), !0);
                  });
                  break;
                default:
                  console.log(
                    '[Leaflet.Geodesic] fromGeoJson() - Type "'.concat(
                      t.geometry.type,
                      '" not supported.'
                    )
                  );
              }
            }),
            n.length && this.setLatLngs(n),
            this
          );
        }),
        (n.prototype.distance = function (t, n) {
          return this.geom.distance(g(t), g(n));
        }),
        n
      );
    })(i.Polyline),
    d = (function (t) {
      function n(n, e) {
        var a,
          o = t.call(this, [], e) || this;
        (o.defaultOptions = { wrap: !0, steps: 24, fill: !0, noClip: !0 }),
          (o.statistics = {
            distanceArray: [],
            totalDistance: 0,
            points: 0,
            vertices: 0,
          }),
          i.Util.setOptions(o, s(s({}, o.defaultOptions), e));
        var r = o.options;
        return (
          (o.radius = null !== (a = r.radius) && void 0 !== a ? a : 1e6),
          (o.center = void 0 === n ? new i.LatLng(0, 0) : g(n)),
          (o.geom = new c(o.options)),
          o.update(),
          o
        );
      }
      return (
        o(n, t),
        (n.prototype.update = function () {
          var n = this.geom.circle(this.center, this.radius);
          if (
            ((this.statistics = this.geom.updateStatistics(
              [[this.center]],
              [n]
            )),
            (this.statistics.totalDistance = this.geom
              .multilineDistance([n])
              .reduce(function (t, n) {
                return t + n;
              }, 0)),
            this.options.wrap)
          ) {
            var e = this.geom.splitCircle(n);
            t.prototype.setLatLngs.call(this, e);
          } else t.prototype.setLatLngs.call(this, n);
        }),
        (n.prototype.distanceTo = function (t) {
          var n = g(t);
          return this.geom.distance(this.center, n);
        }),
        (n.prototype.setLatLng = function (t, n) {
          (this.center = g(t)),
            (this.radius = null != n ? n : this.radius),
            this.update();
        }),
        (n.prototype.setRadius = function (t, n) {
          (this.radius = t),
            (this.center = n ? g(n) : this.center),
            this.update();
        }),
        n
      );
    })(i.Polyline);
  void 0 !== window.L &&
    ((window.L.Geodesic = f),
    (window.L.geodesic = function () {
      for (var t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
      return new (f.bind.apply(f, r([void 0], t, !1)))();
    }),
    (window.L.GeodesicCircle = d),
    (window.L.geodesiccircle = function () {
      for (var t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
      return new (d.bind.apply(d, r([void 0], t, !1)))();
    })),
    (t.GeodesicCircleClass = d),
    (t.GeodesicLine = f);
});
