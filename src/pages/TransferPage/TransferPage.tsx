import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Button,
  Typography,
  QuestionCircleSvg,
  SelectInput,
} from "@chainsafe/common-components";
import { Form, Formik } from "formik";
import clsx from "clsx";

import { useChainbridge, useHomeBridge } from "../../contexts";
import { object, string } from "yup";
import { useHistory } from "@chainsafe/common-components";
import { utils } from "ethers";
import { useNetworkManager } from "../../contexts/NetworkManagerContext/NetworkManagerContext";
import { isValidSubstrateAddress } from "../../utils/Helpers";
import { showImageUrl } from "../../utils/Helpers";
import { useStyles } from "./styles";

import {
  TransferActiveModal,
  NetworkUnsupportedModal,
  PreflightModalTransfer,
  ChangeNetworkDrawer,
  AboutDrawer,
} from "../../modules";
import {
  AddressInput,
  TokenSelectInput,
  TokenInput,
  Fees,
} from "../../components";

import HomeNetworkConnectView from "./HomeNetworkConnectView";

import makeValidationSchema from "./makeValidationSchema";

export type PreflightDetails = {
  tokenAmount: number;
  token: string;
  tokenSymbol: string;
  receiver: string;
};
type Inputs = {
  token: string;
  example: string;
  exampleRequired: string;
};

const TransferPage = () => {
  const classes = useStyles();
  const { walletType, setWalletType } = useNetworkManager();

  const {
    deposit,
    setDestinationChain,
    transactionStatus,
    resetDeposit,
    bridgeFee,
    tokens,
    isReady,
    homeConfig,
    destinationChainConfig,
    destinationChains,
    address,
    checkSupplies,
  } = useChainbridge();

  const { accounts, selectAccount } = useHomeBridge();
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [changeNetworkOpen, setChangeNetworkOpen] = useState<boolean>(false);
  const [preflightModalOpen, setPreflightModalOpen] = useState<boolean>(false);

  const [preflightDetails, setPreflightDetails] = useState<PreflightDetails>({
    receiver: "",
    token: "",
    tokenAmount: 0,
    tokenSymbol: "",
  });

  const { redirect } = useHistory();

  useEffect(() => {
    if (walletType !== "select" && walletConnecting === true) {
      setWalletConnecting(false);
    } else if (walletType === "select") {
      setWalletConnecting(true);
    }
  }, [walletType, walletConnecting]);

  const transferSchema = makeValidationSchema({
    preflightDetails,
    tokens,
    bridgeFee,
    homeConfig,
    destinationChainConfig,
    checkSupplies,
  });

  const handleClick = (txHash: string) => {
    const url = `/explorer/transaction/${txHash}`;

    redirect(url);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      token: "",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <article className={classes.root}>
      <HomeNetworkConnectView
        isReady={isReady}
        accounts={accounts}
        address={address}
        classes={classes}
        walletConnecting={walletConnecting}
        walletType={walletType}
        homeConfig={homeConfig}
        setWalletType={setWalletType}
        setChangeNetworkOpen={setChangeNetworkOpen}
        selectAccount={selectAccount}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <section>
          <SelectInput
            label="Destination Network"
            className={classes.generalInput}
            disabled={!homeConfig}
            options={destinationChains.map((dc: any) => ({
              label: dc.name,
              value: dc.domainId,
            }))}
            onChange={(value) => setDestinationChain(value)}
            value={destinationChainConfig?.domainId}
          />
        </section>
        <section className={classes.currencySection}>
          <section className={classes.currencySelector}>
            <TokenSelectInput
              control={control}
              rules={{ required: true }}
              tokens={tokens}
              name="token"
              disabled={!destinationChainConfig}
              label={`Balance: `}
              className={classes.generalInput}
              sync={(tokenAddress) => {
                setPreflightDetails({
                  ...preflightDetails,
                  token: tokenAddress,
                  receiver: "",
                  tokenAmount: 0,
                  tokenSymbol: "",
                });
              }}
              setValue={setValue}
              options={
                Object.keys(tokens).map((t) => ({
                  value: t,
                  label: (
                    <div className={classes.tokenItem}>
                      {tokens[t]?.imageUri && (
                        <img
                          src={showImageUrl(tokens[t]?.imageUri)}
                          alt={tokens[t]?.symbol}
                        />
                      )}
                      <span>{tokens[t]?.symbol || t}</span>
                    </div>
                  ),
                })) || []
              }
            />
          </section>
          <section className={classes.tokenInputSection}>
            <div className={clsx(classes.tokenInputArea, classes.generalInput)}>
              <TokenInput
                classNames={{
                  input: clsx(classes.tokenInput, classes.generalInput),
                  button: classes.maxButton,
                }}
                tokenSelectorKey="token"
                tokens={tokens}
                disabled={
                  !destinationChainConfig ||
                  !preflightDetails.token ||
                  preflightDetails.token === ""
                }
                name="tokenAmount"
                label="Amount to send"
                setValue={setValue}
              />
            </div>
          </section>
        </section>
        <section>
          {/* <AddressInput
                disabled={!destinationChainConfig}
                name="receiver"
                label="Destination Address"
                placeholder="Please enter the receiving address"
                className={classes.address}
                classNames={{
                  input: classes.addressInput,
                }}
                senderAddress={`${address}`}
                sendToSameAccountHelper={
                  destinationChainConfig?.type === homeConfig?.type
                }
              /> */}
        </section>
        {/* <Fees
              amountFormikName="tokenAmount"
              className={classes.fees}
              fee={bridgeFee}
              feeSymbol={homeConfig?.nativeTokenSymbol}
              symbol={
                preflightDetails && tokens[preflightDetails.token]
                  ? tokens[preflightDetails.token].symbol
                  : undefined
              }
            /> */}
        <section>
          <Button type="submit" fullsize variant="primary">
            Start transfer
          </Button>
        </section>
        <section>
          <QuestionCircleSvg
            onClick={() => setAboutOpen(true)}
            className={classes.faqButton}
          />
        </section>
      </form>
      <AboutDrawer open={aboutOpen} close={() => setAboutOpen(false)} />
      <ChangeNetworkDrawer
        open={changeNetworkOpen}
        close={() => setChangeNetworkOpen(false)}
      />
      <PreflightModalTransfer
        open={preflightModalOpen}
        close={() => setPreflightModalOpen(false)}
        receiver={preflightDetails?.receiver || ""}
        sender={address || ""}
        start={() => {
          setPreflightModalOpen(false);
          preflightDetails &&
            deposit(
              preflightDetails.tokenAmount,
              preflightDetails.receiver,
              preflightDetails.token
            );
        }}
        sourceNetwork={homeConfig?.name || ""}
        targetNetwork={destinationChainConfig?.name || ""}
        tokenSymbol={preflightDetails?.tokenSymbol || ""}
        value={preflightDetails?.tokenAmount || 0}
      />
      <TransferActiveModal
        open={!!transactionStatus}
        close={resetDeposit}
        handleClick={handleClick}
      />
      {/* This is here due to requiring router */}
      <NetworkUnsupportedModal />
    </article>
  );
};
export default TransferPage;
