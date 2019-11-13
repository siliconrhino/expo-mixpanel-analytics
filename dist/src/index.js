import { __assign } from "tslib";
import { Platform, Dimensions, AsyncStorage } from "react-native";
import Constants from "expo-constants";
import { Buffer } from "buffer";
var _a = Dimensions.get("window"), width = _a.width, height = _a.height;
var MIXPANEL_API_URL = "https://api.mixpanel.com";
var ASYNC_STORAGE_KEY = "mixpanel:super:props";
var isIosPlatform = Platform.OS === "ios";
var ExpoMixpanelAnalytics = (function () {
    function ExpoMixpanelAnalytics(token) {
        var _this = this;
        this.ready = false;
        this.superProps = {};
        this.ready = false;
        this.queue = [];
        this.token = token;
        this.userId = null;
        this.clientId = Constants.deviceId;
        this.osVersion = Platform.Version;
        this.superProps;
        this.userAgent = "Custom Ag";
        this.appName = Constants.manifest.name;
        this.appId = Constants.manifest.slug;
        this.appVersion = Constants.manifest.version;
        this.screenSize = width + "x" + height;
        this.deviceName = Constants.deviceName;
        if (isIosPlatform && Constants.platform && Constants.platform.ios) {
            this.platform = Constants.platform.ios.platform;
            this.model = Constants.platform.ios.model;
        }
        else {
            this.platform = "android";
        }
        AsyncStorage.getItem(ASYNC_STORAGE_KEY, function (_, result) {
            if (result) {
                try {
                    _this.superProps = JSON.parse(result) || {};
                }
                catch (_a) { }
            }
            _this.ready = true;
            _this.identify(_this.clientId);
            _this._flush();
        });
    }
    ExpoMixpanelAnalytics.prototype.register = function (props) {
        this.superProps = props;
        try {
            AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(props));
        }
        catch (_a) { }
    };
    ExpoMixpanelAnalytics.prototype.track = function (name, props) {
        this.queue.push({
            name: name,
            props: props
        });
        this._flush();
    };
    ExpoMixpanelAnalytics.prototype.identify = function (userId) {
        this.userId = userId;
    };
    ExpoMixpanelAnalytics.prototype.reset = function () {
        this.identify(this.clientId);
        try {
            AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify({}));
        }
        catch (_a) { }
    };
    ExpoMixpanelAnalytics.prototype.people_set = function (props) {
        this._people("set", props);
    };
    ExpoMixpanelAnalytics.prototype.people_set_once = function (props) {
        this._people("set_once", props);
    };
    ExpoMixpanelAnalytics.prototype.people_unset = function (props) {
        this._people("unset", props);
    };
    ExpoMixpanelAnalytics.prototype.people_increment = function (props) {
        this._people("add", props);
    };
    ExpoMixpanelAnalytics.prototype.people_append = function (props) {
        this._people("append", props);
    };
    ExpoMixpanelAnalytics.prototype.people_union = function (props) {
        this._people("union", props);
    };
    ExpoMixpanelAnalytics.prototype.people_delete_user = function () {
        this._people("delete", "");
    };
    ExpoMixpanelAnalytics.prototype._flush = function () {
        if (this.ready) {
            var _loop_1 = function () {
                var event_1 = this_1.queue.pop();
                this_1._pushEvent(event_1).then(function () { return (event_1.sent = true); });
            };
            var this_1 = this;
            while (this.queue.length) {
                _loop_1();
            }
        }
    };
    ExpoMixpanelAnalytics.prototype._people = function (operation, props) {
        if (this.userId) {
            var data = {
                $token: this.token,
                $distinct_id: this.userId
            };
            data["$" + operation] = props;
            this._pushProfile(data);
        }
    };
    ExpoMixpanelAnalytics.prototype._pushEvent = function (event) {
        var data = {
            event: event.name,
            properties: __assign(__assign({}, (event.props || {})), this.superProps)
        };
        if (this.userId) {
            data.properties.distinct_id = this.userId;
        }
        data.properties.token = this.token;
        data.properties.user_agent = this.userAgent;
        data.properties.app_name = this.appName;
        data.properties.app_id = this.appId;
        data.properties.app_version = this.appVersion;
        data.properties.screen_size = this.screenSize;
        data.properties.client_id = this.clientId;
        data.properties.device_name = this.deviceName;
        if (this.platform) {
            data.properties.platform = this.platform;
        }
        if (this.model) {
            data.properties.model = this.model;
        }
        if (this.osVersion) {
            data.properties.os_version = this.osVersion;
        }
        var buffer = new Buffer(JSON.stringify(data)).toString("base64");
        return fetch(MIXPANEL_API_URL + "/track/?data=" + buffer);
    };
    ExpoMixpanelAnalytics.prototype._pushProfile = function (data) {
        data = new Buffer(JSON.stringify(data)).toString("base64");
        return fetch(MIXPANEL_API_URL + "/engage/?data=" + data);
    };
    return ExpoMixpanelAnalytics;
}());
export { ExpoMixpanelAnalytics };
export default ExpoMixpanelAnalytics;
//# sourceMappingURL=index.js.map