"use strict";
//modified version of "superagent-node-http-timings" https://npmjs.org/package/superagent-node-http-timings
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
const functions_1 = require("./functions");
const process_1 = require("process");
const UPDATE_PER_SEC = 2;
const NS_PER_SEC = 1e9;
function getHrTimeDurationInNs(startTime, endTime) {
    const secondDiff = endTime[0] - startTime[0];
    const nanoSecondDiff = endTime[1] - startTime[1];
    const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff;
    return diffInNanoSecond;
}
class Times {
}
function Time(callback, report) {
    return async function logRequestDetails(agent) {
        agent.on("request", ({ req }) => {
            let prevhrtime;
            let dataintime = 0;
            let data_a_second = 0;
            const eventTimes = new Times();
            eventTimes.startAt = process_1.hrtime();
            report({
                message: "Request Start 0/6",
            });
            req.on("socket", (socket) => {
                report({
                    message: "Socket Assigned 1/6",
                });
                eventTimes.socketAssigned = process_1.hrtime();
                socket.on("lookup", () => {
                    report({
                        message: "Dns Lookup 2/6",
                    });
                    eventTimes.dnsLookupAt = process_1.hrtime();
                });
                socket.on("connect", () => {
                    report({
                        message: "Connected 3/6",
                    });
                    eventTimes.tcpConnectionAt = process_1.hrtime();
                });
                socket.on("secureConnect", () => {
                    report({
                        message: "Tls Handshake 4/6",
                    });
                    eventTimes.tlsHandshakeAt = process_1.hrtime();
                });
                socket.on("timeout", () => {
                    const err = new Error(`ETIMEDOUT for url: ${req.url}`);
                    callback(err);
                });
            });
            req.on("response", (res) => {
                let len = 0;
                res.once("readable", () => {
                    prevhrtime = process_1.hrtime();
                    report({
                        message: "First Byte 5/6",
                    });
                    eventTimes.firstByteAt = process_1.hrtime();
                });
                res.on("data", (d) => {
                    let time = process_1.hrtime();
                    let difference_in_nanoseconds = getHrTimeDurationInNs(prevhrtime, time);
                    if (difference_in_nanoseconds >=
                        NS_PER_SEC / UPDATE_PER_SEC) {
                        prevhrtime = time;
                        data_a_second =
                            (NS_PER_SEC / difference_in_nanoseconds) *
                                (len - dataintime);
                        dataintime = len;
                    }
                    len += d.length;
                    report({
                        message: `Downloading: ${functions_1.convert_data(len)} (${functions_1.convert_data(data_a_second)}/s)`,
                    });
                });
                res.on("end", () => {
                    report({
                        message: "Finished 6/6",
                    });
                    eventTimes.endAt = process_1.hrtime();
                    callback(null, getTimings(eventTimes));
                });
            });
        });
    };
}
exports.Time = Time;
function getTimings(eventTimes) {
    return {
        socketAssigned: getHrTimeDurationInNs(eventTimes.startAt, eventTimes.socketAssigned),
        // There is no DNS lookup with IP address
        dnsLookup: eventTimes.dnsLookupAt !== undefined
            ? getHrTimeDurationInNs(eventTimes.socketAssigned, eventTimes.dnsLookupAt)
            : undefined,
        tcpConnection: getHrTimeDurationInNs(eventTimes.dnsLookupAt || eventTimes.socketAssigned, eventTimes.tcpConnectionAt),
        // There is no TLS handshake without https
        tlsHandshake: eventTimes.tlsHandshakeAt !== undefined
            ? getHrTimeDurationInNs(eventTimes.tcpConnectionAt, eventTimes.tlsHandshakeAt)
            : undefined,
        firstByte: getHrTimeDurationInNs(eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt, eventTimes.firstByteAt),
        contentTransfer: getHrTimeDurationInNs(eventTimes.firstByteAt, eventTimes.endAt),
        total: getHrTimeDurationInNs(eventTimes.startAt, eventTimes.endAt),
    };
}
