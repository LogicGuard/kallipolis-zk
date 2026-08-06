// Kallipolis ZK eBPF XDP Linux Kernel Socket Filter for EVM RPC Traffic
// Language: C (eBPF Kernel Target)
// License: GPL

#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/in.h>

#ifndef __section
#define __section(NAME) __attribute__((section(NAME), used))
#endif

// Known blocked malicious function selector: 0x2e1a7d4d (unauthorized withdraw)
#define BLOCKED_SELECTOR_1 0x2e1a7d4d
#define BLOCKED_SELECTOR_2 0x3ee5aeb5

__section("xdp")
int kallipolis_rpc_packet_filter(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;

    // 1. Parse Ethernet Header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) {
        return XDP_PASS;
    }

    if (eth->h_proto != __constant_htons(ETH_P_IP)) {
        return XDP_PASS;
    }

    // 2. Parse IP Header
    struct iphdr *ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) {
        return XDP_PASS;
    }

    if (ip->protocol != IPPROTO_TCP) {
        return XDP_PASS;
    }

    // 3. Parse TCP Header
    struct tcphdr *tcp = (struct tcphdr *)((void *)ip + (ip->ihl * 4));
    if ((void *)(tcp + 1) > data_end) {
        return XDP_PASS;
    }

    // Inspect RPC destination port 8545 (EVM RPC node)
    if (tcp->dest != __constant_htons(8545)) {
        return XDP_PASS;
    }

    // Check payload bytes for known malicious calldata selectors
    unsigned char *payload = (unsigned char *)((void *)tcp + (tcp->doff * 4));
    if ((void *)(payload + 4) <= data_end) {
        unsigned int selector = *(unsigned int *)payload;
        if (selector == __constant_htonl(BLOCKED_SELECTOR_1) ||
            selector == __constant_htonl(BLOCKED_SELECTOR_2)) {
            // Drop packet immediately at network driver layer before hitting EVM
            return XDP_DROP;
        }
    }

    return XDP_PASS;
}

char _license[] __section("license") = "GPL";
