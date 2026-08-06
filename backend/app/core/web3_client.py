import logging
from typing import Optional, Dict, Any
from web3 import Web3, HTTPProvider
from app.core.config import settings

logger = logging.getLogger("kallipolis.web3")

class Web3MultiRPCClient:
    def __init__(self):
        self.networks = {
            "polygon_mainnet": {
                "chain_id": 137,
                "rpcs": [settings.POLYGON_MAINNET_RPC, "https://rpc.ankr.com/polygon", "https://1rpc.io/mate"]
            },
            "polygon_zkevm": {
                "chain_id": 1101,
                "rpcs": [settings.POLYGON_ZKEVM_RPC, "https://rpc.ankr.com/polygon_zkevm"]
            },
            "polygon_amoy": {
                "chain_id": 80002,
                "rpcs": [settings.POLYGON_AMOY_RPC, "https://rpc-amoy.polygon.technology"]
            }
        }
        self.active_clients: Dict[str, Web3] = {}
        self._initialize_clients()

    def _initialize_clients(self):
        for net_name, config in self.networks.items():
            connected = False
            for rpc_url in config["rpcs"]:
                try:
                    w3 = Web3(HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
                    if w3.is_connected():
                        self.active_clients[net_name] = w3
                        logger.info(f"Connected Web3 for {net_name} via {rpc_url}")
                        connected = True
                        break
                except Exception as e:
                    logger.warning(f"RPC connection failed for {net_name} on {rpc_url}: {e}")
            if not connected:
                # Fallback instance
                self.active_clients[net_name] = Web3(HTTPProvider(config["rpcs"][0]))

    def get_client(self, network: str = "polygon_mainnet") -> Web3:
        return self.active_clients.get(network, self.active_clients["polygon_mainnet"])

    async def get_contract_code(self, address: str, network: str = "polygon_mainnet") -> str:
        try:
            w3 = self.get_client(network)
            checksum = Web3.to_checksum_address(address)
            code = w3.eth.get_code(checksum)
            return code.hex()
        except Exception as e:
            logger.error(f"Error fetching code for {address}: {e}")
            return "0x"

    async def get_balance(self, address: str, network: str = "polygon_mainnet") -> float:
        try:
            w3 = self.get_client(network)
            checksum = Web3.to_checksum_address(address)
            wei_balance = w3.eth.get_balance(checksum)
            return float(Web3.from_wei(wei_balance, 'ether'))
        except Exception as e:
            logger.error(f"Error fetching balance for {address}: {e}")
            return 0.0

web3_client = Web3MultiRPCClient()
