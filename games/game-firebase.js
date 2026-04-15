/**
 * Game Firebase Integration — The Burnay Labs
 * Add to any game: <script src="../game-firebase.js"></script>
 *
 * URL params:
 *   ?student={id}     — Firestore student doc ID
 *   &game={id}        — Firestore game doc ID under that student
 *   &source=teacher   — If set, play count is NOT incremented
 *   &test=true        — Teacher test mode: banner + no Firestore
 *
 * Usage in game code:
 *   window.GameFirebase.loadProgress(function(data) { ... });
 *   window.GameFirebase.saveProgress({ score: 100, ... });
 *   window.GameFirebase.isStudentMode();  // true if play should count
 *   window.GameFirebase.isTestMode();     // true if ?test=true
 *
 * Test mode (automatic for ALL games):
 *   - Auto-injects a yellow "TEACHER TEST" banner at top of page
 *   - Does NOT read/write Firestore — teacher progress is local only
 *   - Games can check GameFirebase.isTestMode() to use separate localStorage
 *   - Dashboard 🧪 Test button adds ?test=true automatically
 *
 * Listen for readiness:
 *   window.addEventListener('gameFirebaseReady', function() { ... });
 */
(function () {
  var params = new URLSearchParams(window.location.search);
  var studentId = params.get("student");
  var gameId = params.get("game");
  var source = params.get("source");
  var isTest = params.has("test");

  // ─── TEST MODE BANNER (auto-injected for ALL games) ───
  if (isTest) {
    function injectTestBanner() {
      if (!document.body) {
        setTimeout(injectTestBanner, 50);
        return;
      }
      if (document.getElementById("game-test-banner")) return;
      // Hide any game-specific test banner — we'll use the shared one
      var existing = document.getElementById("test-banner");
      if (existing) existing.style.display = "none";
      var b = document.createElement("div");
      b.id = "game-test-banner";
      b.style.cssText =
        "position:fixed;top:0;left:0;right:0;z-index:99999;" +
        "background:#f59e0b;color:#000;text-align:center;" +
        "font-weight:800;font-size:13px;padding:6px 32px 6px 12px;" +
        "letter-spacing:1px;font-family:system-ui,sans-serif;" +
        "transition:opacity 0.5s ease,transform 0.5s ease;";
      b.textContent = "\uD83E\uDDEA TEACHER TEST";
      // Close button
      var x = document.createElement("button");
      x.textContent = "\u2715";
      x.style.cssText =
        "position:absolute;right:8px;top:50%;transform:translateY(-50%);" +
        "background:none;border:none;color:#000;font-size:16px;font-weight:bold;" +
        "cursor:pointer;padding:2px 6px;line-height:1;opacity:0.6;";
      x.onmouseover = function () {
        x.style.opacity = "1";
      };
      x.onmouseout = function () {
        x.style.opacity = "0.6";
      };
      function dismissBanner() {
        b.style.opacity = "0";
        b.style.transform = "translateY(-100%)";
        setTimeout(function () {
          b.style.display = "none";
        }, 500);
      }
      x.onclick = dismissBanner;
      b.appendChild(x);
      document.body.insertBefore(b, document.body.firstChild);
      // Auto-dismiss after 3 seconds
      setTimeout(dismissBanner, 3000);
    }
    injectTestBanner();
  }

  // No-op fallback when not in student context OR in test mode
  if (!studentId || !gameId || isTest) {
    window.GameFirebase = {
      ready: false,
      isStudentMode: function () {
        return false;
      },
      isTestMode: function () {
        return isTest;
      },
      loadProgress: function (cb) {
        if (cb) cb(null);
      },
      saveProgress: function () {},
      getStudentId: function () {
        return studentId;
      },
      getGameId: function () {
        return gameId;
      },
    };
    window.dispatchEvent(new CustomEvent("gameFirebaseReady"));
    return;
  }

  function loadScript(url, cb) {
    var s = document.createElement("script");
    s.src = url;
    s.onload = cb;
    s.onerror = function () {
      console.error("GameFirebase: Failed to load", url);
    };
    document.head.appendChild(s);
  }

  var firebaseConfig = {
    apiKey: "AIzaSyAki3QaFgKY0cTWAt2R06c86WimoXRVWKs",
    authDomain: "lessonsplatform-e228c.firebaseapp.com",
    projectId: "lessonsplatform-e228c",
    storageBucket: "lessonsplatform-e228c.firebasestorage.app",
    messagingSenderId: "804556322280",
    appId: "1:804556322280:web:85ffeb6fd6a49e321c605d",
  };

  loadScript(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
    function () {
      loadScript(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js",
        function () {
          // Don't re-initialize if already done
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
          var db = firebase.firestore();
          var ref = db
            .collection("students")
            .doc(studentId)
            .collection("games")
            .doc(gameId);

          // Increment playCount based on active time (1 play per hour of active use)
          // Rate-limited: only counts once per 60 minutes
          if (source !== "teacher") {
            ref
              .get()
              .then(function (doc) {
                var data = doc.exists ? doc.data() : {};
                var lastPlayed = data.lastPlayed
                  ? new Date(data.lastPlayed).getTime()
                  : 0;
                var now = Date.now();
                var elapsed = now - lastPlayed;
                var ONE_HOUR = 60 * 60 * 1000;

                // Only increment if more than 1 hour since last play
                if (elapsed >= ONE_HOUR) {
                  var playCount = (data.playCount || 0) + 1;
                  return ref.set(
                    {
                      playCount: playCount,
                      lastPlayed: new Date().toISOString(),
                    },
                    { merge: true },
                  );
                } else {
                  // Just update lastPlayed timestamp
                  return ref.set(
                    { lastPlayed: new Date().toISOString() },
                    { merge: true },
                  );
                }
              })
              .catch(function (e) {
                console.error("GameFirebase: Play count error", e);
              });

            // Track active time — count a play after 3 min of active use
            var activeSeconds = 0;
            var activeInterval = setInterval(function () {
              if (!document.hidden) activeSeconds++;
              // After 3 minutes of active time, record another play (if hour cooldown passed)
              if (activeSeconds >= 180) {
                activeSeconds = 0;
                ref.get().then(function (doc) {
                  var data = doc.exists ? doc.data() : {};
                  var lp = data.lastPlayed
                    ? new Date(data.lastPlayed).getTime()
                    : 0;
                  if (Date.now() - lp >= ONE_HOUR) {
                    var pc = (data.playCount || 0) + 1;
                    ref.set(
                      {
                        playCount: pc,
                        lastPlayed: new Date().toISOString(),
                      },
                      { merge: true },
                    );
                  }
                });
              }
            }, 1000);
            // Cleanup on page unload
            window.addEventListener("beforeunload", function () {
              clearInterval(activeInterval);
            });
          }

          window.GameFirebase = {
            ready: true,
            db: db,
            ref: ref,
            isStudentMode: function () {
              return source !== "teacher";
            },
            isTestMode: function () {
              return false;
            },
            loadProgress: function (cb) {
              ref
                .get()
                .then(function (doc) {
                  var data = doc.exists ? doc.data() : {};
                  if (cb) cb(data.progress || null);
                })
                .catch(function (e) {
                  console.error("GameFirebase: Load error", e);
                  if (cb) cb(null);
                });
            },
            saveProgress: function (data) {
              ref
                .set(
                  {
                    progress: data,
                    lastUpdated: new Date().toISOString(),
                  },
                  { merge: true },
                )
                .catch(function (e) {
                  console.error("GameFirebase: Save error", e);
                });
            },
            getStudentId: function () {
              return studentId;
            },
            getGameId: function () {
              return gameId;
            },
          };

          // Signal readiness to game code
          window.dispatchEvent(new CustomEvent("gameFirebaseReady"));
          console.log(
            "GameFirebase: Ready (student=" +
              studentId +
              ", game=" +
              gameId +
              ", mode=" +
              (source === "teacher" ? "teacher-preview" : "student-play") +
              ")",
          );
        },
      );
    },
  );
})();
