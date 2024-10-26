//modified version of "superagent-node-http-timings" https://npmjs.org/package/superagent-node-http-timings

import { convert_data } from "./functions";
import { hrtime } from "process";

const UPDATE_PER_SEC = 2;
const NS_PER_SEC = 1e9;

function getHrTimeDurationInNs(
    startTime: [number, number],
    endTime: [number, number]
) {
    const secondDiff = endTime[0] - startTime[0];
    const nanoSecondDiff = endTime[1] - startTime[1];
    const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff;

    return diffInNanoSecond;
}

class Times {
    startAt?: [number, number];
    socketAssigned?: [number, number];
    dnsLookupAt?: [number, number];
    tcpConnectionAt?: [number, number];
    tlsHandshakeAt?: [number, number];
    firstByteAt?: [number, number];
    endAt?: [number, number];
}

export function Time(callback: Function, report: Function) {
    return async function logRequestDetails(agent: any) {
        agent.on("request", ({ req }: Record<any, any>) => {
            let prevhrtime;
            let dataintime = 0;
            let data_a_second = 0;
            const eventTimes = new Times();
            eventTimes.startAt = hrtime();
            report({
                message: "Request Start 0/6",
            });
            req.on("socket", (socket: any) => {
                report({
                    message: "Socket Assigned 1/6",
                });
                eventTimes.socketAssigned = hrtime();
                socket.on("lookup", () => {
                    report({
                        message: "Dns Lookup 2/6",
                    });
                    eventTimes.dnsLookupAt = hrtime();
                });
                socket.on("connect", () => {
                    report({
                        message: "Connected 3/6",
                    });
                    eventTimes.tcpConnectionAt = hrtime();
                });
                socket.on("secureConnect", () => {
                    report({
                        message: "Tls Handshake 4/6",
                    });
                    eventTimes.tlsHandshakeAt = hrtime();
                });
                socket.on("timeout", () => {
                    const err = new Error(`ETIMEDOUT for url: ${req.url}`);
                    callback(err);
                });
            });
            req.on("response", (res: any) => {
                let len = 0;
                res.once("readable", () => {
                    prevhrtime = hrtime();
                    report({
                        message: "First Byte 5/6",
                    });
                    eventTimes.firstByteAt = hrtime();
                });
                res.on("data", (d: string) => {
                    let time = hrtime();
                    let difference_in_nanoseconds = getHrTimeDurationInNs(
                        prevhrtime,
                        time
                    );
                    if (
                        difference_in_nanoseconds >=
                        NS_PER_SEC / UPDATE_PER_SEC
                    ) {
                        prevhrtime = time;
                        data_a_second =
                            (NS_PER_SEC / difference_in_nanoseconds) *
                            (len - dataintime);
                        dataintime = len;
                    }

                    len += d.length;
                    report({
                        message: `Downloading: ${convert_data(len)} (${convert_data(data_a_second)}/s)`,
                    });
                });
                res.on("end", () => {
                    report({
                        message: "Finished 6/6",
                    });
                    eventTimes.endAt = hrtime();
                    callback(null, getTimings(eventTimes));
                });
            });
        });
    };
}

function getTimings(eventTimes: Record<any, any>) {
    return {
        socketAssigned: getHrTimeDurationInNs(
            eventTimes.startAt,
            eventTimes.socketAssigned
        ),
        // There is no DNS lookup with IP address
        dnsLookup:
            eventTimes.dnsLookupAt !== undefined
                ? getHrTimeDurationInNs(
                      eventTimes.socketAssigned,
                      eventTimes.dnsLookupAt
                  )
                : undefined,
        tcpConnection: getHrTimeDurationInNs(
            eventTimes.dnsLookupAt || eventTimes.socketAssigned,
            eventTimes.tcpConnectionAt
        ),
        // There is no TLS handshake without https
        tlsHandshake:
            eventTimes.tlsHandshakeAt !== undefined
                ? getHrTimeDurationInNs(
                      eventTimes.tcpConnectionAt,
                      eventTimes.tlsHandshakeAt
                  )
                : undefined,
        firstByte: getHrTimeDurationInNs(
            eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt,
            eventTimes.firstByteAt
        ),
        contentTransfer: getHrTimeDurationInNs(
            eventTimes.firstByteAt,
            eventTimes.endAt
        ),
        total: getHrTimeDurationInNs(eventTimes.startAt, eventTimes.endAt),
    };
}
