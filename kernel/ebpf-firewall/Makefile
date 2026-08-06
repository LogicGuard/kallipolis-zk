# Kallipolis ZK eBPF XDP Linux Kernel Firewall Makefile
TARGET = xdp_filter.o
CLANG ?= clang
ARCH ?= x86

all: $(TARGET)

$(TARGET): src/xdp_filter.c
	$(CLANG) -target bpf -D__TARGET_ARCH_$(ARCH) -O2 -g -c $< -o $@

clean:
	rm -f $(TARGET)
