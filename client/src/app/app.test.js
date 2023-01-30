import { getGalaxyInstance, setGalaxyInstance } from "app";
import sinon from "sinon";
import Backbone from "backbone";
import { getAppRoot } from "onload";
import galaxyOptions from "@tests/qunit/test-data/bootstrapped";
import serverdata from "@tests/qunit/test-data/fakeserver";

export function setupTestGalaxy(galaxyOptions_ = null) {
    galaxyOptions_ = galaxyOptions_ || galaxyOptions;
    setGalaxyInstance((GalaxyApp) => {
        const galaxy = new GalaxyApp(galaxyOptions_);
        galaxy.currHistoryPanel = {
            model: new Backbone.Model(),
        };
        return galaxy;
    });
}

describe("App base construction/initializiation defaults", () => {
    beforeEach(() => {
        setupTestGalaxy(galaxyOptions);
        window.WAIT_FADE = 300;
        window.fakeserver = sinon.fakeServer.create();
        for (const route in serverdata) {
            window.fakeserver.respondWith("GET", getAppRoot() + route, [
                200,
                { "Content-Type": "application/json" },
                serverdata[route].data,
            ]);
        }
    });

    afterEach(() => {
        if (window.fakeserver) {
            window.fakeserver.restore();
            delete window.fakeserver;
        }
    });

    test("App base construction/initializiation defaults", function () {
        const app = getGalaxyInstance();
        expect(app.options && typeof app.options === "object").toBeTruthy();
        expect(app.config && typeof app.config === "object").toBeTruthy();
        expect(app.user && typeof app.config === "object").toBeTruthy();
        expect(app.localize).toBe(window._l);
    });

    test("App base default options", function () {
        const app = getGalaxyInstance();
        expect(app.options !== undefined && typeof app.options === "object").toBeTruthy();
        expect(app.options.root).toBe("/");
        expect(app.options.patchExisting).toBe(true);
    });

    test("App base extends from Backbone.Events", function () {
        const app = getGalaxyInstance();
        ["on", "off", "trigger", "listenTo", "stopListening"].forEach(function (fn) {
            expect(app.fn && typeof app[fn] === "function").toBeTruthy();
        });
    });

    // // We no longer want this behavior, but leaving the test to express that
    test("App base will patch in attributes from existing Galaxy objects", function () {
        const existingApp = getGalaxyInstance();
        existingApp.foo = 123;

        const newApp = setGalaxyInstance((GalaxyApp) => {
            return new GalaxyApp();
        });

        expect(newApp.foo === 123).toBeTruthy();
    });

    test("App base config", function () {
        const app = getGalaxyInstance();
        expect(app.config && typeof app.config === "object").toBeTruthy();
        expect(app.config.allow_user_deletion).toBe(false);
        expect(app.config.allow_user_creation).toBe(true);
        expect(app.config.wiki_url).toBe("https://galaxyproject.org/");
        expect(app.config.ftp_upload_site).toBe(null);
    });

    test("App base user", function () {
        const app = getGalaxyInstance();
        expect(app.user !== undefined && typeof app.user === "object").toBeTruthy();
        expect(app.user.isAdmin() === false).toBeTruthy();
    });
});
