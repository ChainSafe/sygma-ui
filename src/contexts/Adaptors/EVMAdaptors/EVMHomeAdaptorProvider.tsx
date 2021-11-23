import React from "react";
import { useWeb3 } from "@chainsafe/web3-context";
import { useCallback, useEffect, useState } from "react";
import { useNetworkManager } from "../../NetworkManagerContext";
import { IHomeBridgeProviderProps } from "../interfaces";
import { HomeBridgeContext } from "../../HomeBridgeContext";
import { getNetworkName } from "../../../utils/Helpers";

import makeDeposit from "./makeDeposit";
import makeWrappedToken from "./makeWrappedToken";
import makeUnwrappedToken from "./makeUnwrappedToken";
import makeHandleCheckSupplies from "./makeHandleCheckSupplies";
import { useSetBridgeSettingsHook } from "./useSetBridgeSettingsHook";
import { useConnectWallet } from "./useConnectWallet";

export const EVMHomeAdaptorProvider = ({
  children,
}: IHomeBridgeProviderProps) => {
  const {
    isReady,
    network,
    provider,
    gasPrice,
    address,
    tokens,
    wallet,
    checkIsReady,
    ethBalance,
    onboard,
    resetOnboard,
  } = useWeb3();

  const {
    homeChainConfig,
    setTransactionStatus,
    setDepositNonce,
    handleSetHomeChain,
    homeChains,
  } = useNetworkManager();

  const [depositAmount, setDepositAmount] = useState<number | undefined>();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [networkId, setNetworkId] = useState(0);
  const [homeTransferTxHash, setHomeTransferTxHash] = useState<string>("");

  useEffect(() => {
    if (network) {
      const chain = homeChains.find((chain) => chain.networkId === network);
      setNetworkId(network);
      if (chain) {
        handleSetHomeChain(chain.domainId);
      }
    }
  }, [handleSetHomeChain, homeChains, network, setNetworkId]);

  const { homeBridge, wrapper, wrapTokenConfig } = useConnectWallet(
    isReady,
    checkIsReady,
    onboard,
    homeChainConfig,
    provider,
    network
  );
  const [bridgeFee, relayerThreshold] = useSetBridgeSettingsHook(homeBridge);

  const handleConnect = useCallback(async () => {
    if (wallet && wallet.connect && network) {
      await onboard?.walletSelect("metamask");
      await wallet.connect();
    }
  }, [wallet, network, onboard]);

  const handleCheckSupplies = makeHandleCheckSupplies(homeChainConfig);

  const deposit = makeDeposit(
    setTransactionStatus,
    setDepositNonce,
    setHomeTransferTxHash,
    setDepositAmount,
    setSelectedToken,
    gasPrice,
    homeChainConfig,
    homeBridge,
    provider,
    address,
    bridgeFee
  );

  const wrapToken = makeWrappedToken(
    gasPrice,
    homeChainConfig,
    wrapTokenConfig,
    wrapper,
    provider
  );

  const unwrapToken = makeUnwrappedToken(
    gasPrice,
    homeChainConfig,
    wrapTokenConfig,
    wrapper,
    provider
  );

  return (
    <HomeBridgeContext.Provider
      value={{
        connect: handleConnect,
        disconnect: async () => {
          await resetOnboard();
        },
        getNetworkName,
        networkId,
        homeTransferTxHash,
        bridgeFee,
        deposit,
        depositAmount,
        selectedToken,
        setDepositAmount,
        setSelectedToken,
        tokens,
        relayerThreshold,
        wrapTokenConfig,
        wrapper,
        wrapToken,
        unwrapToken,
        isReady,
        chainConfig: homeChainConfig,
        address,
        nativeTokenBalance: ethBalance,
        handleCheckSupplies,
      }}
    >
      {children}
    </HomeBridgeContext.Provider>
  );
};
