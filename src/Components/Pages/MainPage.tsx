import React, { useState } from "react";
import { makeStyles, createStyles, ITheme } from "@imploy/common-themes";
import AboutDrawer from "../../Modules/AboutDrawer";
import ChangeNetworkDrawer from "../../Modules/ChangeNetworkDrawer";
import NetworkUnsupportedModal from "../../Modules/NetworkUnsupportedModal";
import PreflightModal from "../../Modules/PreflightModal";
import {
  Button,
  Typography,
  QuestionCircleSvg,
  SelectInput,
} from "@imploy/common-components";
import { Form, Formik } from "formik";
import AddressInput from "../Custom/AddressInput";
import clsx from "clsx";
import TransactionActiveModal from "../../Modules/TransactionActiveModal";
import { useWeb3 } from "@chainsafe/web3-context";
import { useChainbridge } from "../../Contexts/ChainbridgeContext";
import TokenSelectInput from "../Custom/TokenSelectInput";
import TokenInput from "../Custom/TokenInput";
import { number, object, string } from "yup";
import { utils } from "ethers";

const useStyles = makeStyles(({ constants, palette }: ITheme) =>
  createStyles({
    root: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: 460,
      display: "flex",
      flexDirection: "column",
      padding: constants.generalUnit * 6,
      border: `1px solid ${palette.additional["gray"][7]}`,
      borderRadius: 4,
      color: palette.additional["gray"][8],
      overflow: "hidden",
    },
    walletArea: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    connectButton: {
      margin: `${constants.generalUnit * 3}px 0 ${constants.generalUnit * 6}px`,
    },
    connecting: {
      textAlign: "center",
      marginBottom: constants.generalUnit * 2,
    },
    connected: {
      width: "100%",
      "& > *:first-child": {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      },
    },
    changeButton: {
      cursor: "pointer",
    },
    networkName: {
      padding: `${constants.generalUnit * 2}px ${
        constants.generalUnit * 1.5
      }px`,
      border: `1px solid ${palette.additional["gray"][6]}`,
      borderRadius: 2,
      color: palette.additional["gray"][9],
      marginTop: constants.generalUnit,
      marginBottom: constants.generalUnit * 3,
    },
    formArea: {
      "&.disabled": {
        opacity: 0.4,
      },
    },
    currencySection: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      margin: `${constants.generalUnit * 3}px 0`,
    },
    tokenInputArea: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      paddingRight: constants.generalUnit,
    },
    tokenInput: {
      margin: 0,
      "& > div": {
        height: 32,
        "& input": {
          borderBottomRightRadius: 0,
          borderTopRightRadius: 0,
          borderRight: 0,
        },
      },
      "& span:last-child.error": {
        position: "absolute",
      },
    },
    maxButton: {
      height: 32,
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0,
      left: -1,
      color: palette.additional["gray"][8],
      backgroundColor: palette.additional["gray"][3],
      borderColor: palette.additional["gray"][6],
      "&:hover": {
        borderColor: palette.additional["gray"][6],
        backgroundColor: palette.additional["gray"][7],
        color: palette.common.white.main,
      },
      "&:focus": {
        borderColor: palette.additional["gray"][6],
      },
    },
    currencySelector: {
      width: 120,
      "& *": {
        cursor: "pointer",
      },
    },
    token: {},
    address: {
      margin: 0,
      marginBottom: constants.generalUnit * 3,
    },
    addressInput: {},
    generalInput: {
      "& > span": {
        marginBottom: constants.generalUnit,
      },
    },
    faqButton: {
      cursor: "pointer",
      height: 20,
      width: 20,
      marginTop: constants.generalUnit * 5,
      fill: `${palette.additional["transferUi"][1]} !important`,
    },
    tokenItem: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      cursor: "pointer",
      "& img": {
        display: "block",
        height: 14,
        width: 14,
        marginLeft: 10,
      },
      "& span": {
        minWidth: `calc(100% - 14px)`,
        textAlign: "right",
      },
    },
  })
);

type PreflightDetails = {
  tokenAmount: number;
  token: string;
  tokenSymbol: string;
  receiver: string;
};

const MainPage = () => {
  const classes = useStyles();
  const { isReady, checkIsReady, wallet, onboard, tokens, address } = useWeb3();
  const {
    homeChain,
    destinationChains,
    destinationChain,
    deposit,
    setDestinationChain,
    transactionStatus,
    resetDeposit,
  } = useChainbridge();

  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [changeNetworkOpen, setChangeNetworkOpen] = useState<boolean>(false);
  const [networkUnsupportedOpen, setNetworkUnsupportedOpen] = useState<boolean>(
    false
  );
  const [preflightModalOpen, setPreflightModalOpen] = useState<boolean>(false);

  const [preflightDetails, setPreflightDetails] = useState<PreflightDetails>({
    receiver: "",
    token: "",
    tokenAmount: 0,
    tokenSymbol: "",
  });

  const handleConnect = async () => {
    setWalletConnecting(true);
    !wallet && (await onboard?.walletSelect());
    await checkIsReady();
    setWalletConnecting(false);
  };

  // TODO: Pull from contract
  const DECIMALS = 18;
  const transferSchema = object().shape({
    tokenAmount: number()
      .typeError("Not a valid number")
      .min(
        tokens[preflightDetails.token]
          ? 1 / 10 ** tokens[preflightDetails.token].decimals
          : 1,
        "Please provide a value"
      )
      .test("Token selected", "Please select a token", (value) => {
        if (
          value &&
          preflightDetails &&
          tokens[preflightDetails.token] &&
          tokens[preflightDetails.token].balance
        ) {
          return true;
        } else {
          return false;
        }
      })
      .test("Decimals", `Maximum of ${DECIMALS} decimals`, (value) => {
        // console.log(value);
        if (value && `${value}`.indexOf(".") >= 0) {
          // TODO improve Decimal validation
          // console.log(`${value}`.split(".")[1])
          // console.log(`${value}`.split(".")[1].length)
          // console.log(`${value}`.split(".")[1].length <= DECIMALS )
          return `${value}`.split(".")[1].length <= DECIMALS;
        }
        return true;
      })
      .test("Max", "Insufficent funds", (value) => {
        if (
          preflightDetails &&
          tokens[preflightDetails.token] &&
          tokens[preflightDetails.token].balance
        ) {
          return (value as number) <= tokens[preflightDetails.token].balance;
        }
        return false;
      })
      .required("Please set a value"),
    token: string()
      .test("sync", "", (value) => {
        setPreflightDetails({
          ...preflightDetails,
          token: value as string,
          receiver: "",
          tokenAmount: 0,
          tokenSymbol: "",
        });
        return true;
      })
      .required("Please select a token"),
    receiver: string()
      .test("Valid address", "Please add a valid address", (value) => {
        return utils.isAddress(value as string);
      })
      .required("Please add a receiving address"),
  });

  return (
    <article className={classes.root}>
      <div className={classes.walletArea}>
        {!isReady ? (
          <Button
            className={classes.connectButton}
            fullsize
            onClick={() => {
              handleConnect();
            }}
          >
            Connect Metamask
          </Button>
        ) : walletConnecting ? (
          <section className={classes.connecting}>
            <Typography component="p" variant="h5">
              This app requires access to your wallet, <br />
              please login and authorize access to continue.
            </Typography>
          </section>
        ) : (
          <section className={classes.connected}>
            <div>
              <Typography variant="body1">Home network</Typography>
              <Typography
                className={classes.changeButton}
                variant="body1"
                onClick={() => setChangeNetworkOpen(true)}
              >
                Change
              </Typography>
            </div>
            <Typography
              component="h2"
              variant="h2"
              className={classes.networkName}
            >
              {homeChain?.name}
            </Typography>
          </section>
        )}
      </div>
      <Formik
        initialValues={{
          tokenAmount: 0,
          token: "",
          receiver: "",
        }}
        validationSchema={transferSchema}
        onSubmit={(values) => {
          setPreflightDetails({
            ...values,
            tokenSymbol: tokens[values.token].symbol || "",
          });
          setPreflightModalOpen(true);
        }}
      >
        <Form
          className={clsx(classes.formArea, {
            disabled: !homeChain,
          })}
        >
          <section>
            <SelectInput
              label="Destination Network"
              className={classes.generalInput}
              disabled={!homeChain}
              options={destinationChains.map((dc) => ({
                label: dc.name,
                value: dc.chainId,
              }))}
              onChange={(value) => setDestinationChain(value)}
              value={destinationChain?.chainId}
            />
          </section>
          <section className={classes.currencySection}>
            <section>
              <div
                className={clsx(classes.tokenInputArea, classes.generalInput)}
              >
                <TokenInput
                  classNames={{
                    input: clsx(classes.tokenInput, classes.generalInput),
                    button: classes.maxButton,
                  }}
                  tokenSelectorKey="token"
                  tokens={tokens}
                  disabled={!destinationChain}
                  name="tokenAmount"
                  // min={
                  //   tokens[preflightDetails.token]
                  //   ? 1 / (10 ** tokens[preflightDetails.token].decimals)
                  //   : 1
                  // }
                  max={
                    tokens[preflightDetails.token]
                      ? tokens[preflightDetails.token].balance
                      : 1
                  }
                  // step={
                  //   tokens[preflightDetails.token]
                  //   ? 1 / (10 ** tokens[preflightDetails.token].decimals)
                  //   : 1
                  // }
                  precision={
                    tokens[preflightDetails.token]
                      ? tokens[preflightDetails.token].decimals
                      : 1
                  }
                  // formatter={(value) => {
                  //   console.log("Format", value)
                  //   // do mod check
                  //   const split = `${value}`.split('.')
                  //   if (split[1]) {
                  //     for(let i = split[1].length; i > 0; i--){
                  //       if (split[1][i] != "0"){
                  //         const temp = `${split[0]}.${split[1].substr(0, i)}`
                  //         console.log(temp)
                  //         return  temp
                  //       }
                  //     }
                  //   }

                  //   return `${value}`
                  // }}
                  label="I want to send"
                />
              </div>
            </section>
            <section className={classes.currencySelector}>
              <TokenSelectInput
                tokens={tokens}
                name="token"
                disabled={!destinationChain}
                label={`Balance: `}
                className={classes.generalInput}
                placeholder=""
                options={
                  Object.keys(tokens).map((t) => ({
                    value: t,
                    label: (
                      <div className={classes.tokenItem}>
                        {tokens[t]?.imageUri && (
                          <img
                            src={tokens[t]?.imageUri}
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
          </section>
          <section>
            <AddressInput
              disabled={!destinationChain}
              name="receiver"
              label="Destination Address"
              placeholder="Please enter the receiving address"
              className={classes.address}
              classNames={{
                input: classes.addressInput,
              }}
              senderAddress={`${address}`}
            />
          </section>
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
        </Form>
      </Formik>
      <AboutDrawer open={aboutOpen} close={() => setAboutOpen(false)} />
      <ChangeNetworkDrawer
        open={changeNetworkOpen}
        close={() => setChangeNetworkOpen(false)}
      />
      <NetworkUnsupportedModal
        open={networkUnsupportedOpen}
        close={() => setNetworkUnsupportedOpen(false)}
        network={`Ropsten`}
      />
      <PreflightModal
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
        sourceNetwork={homeChain?.name || ""}
        targetNetwork={destinationChain?.name || ""}
        tokenSymbol={preflightDetails?.tokenSymbol || ""}
        value={preflightDetails?.tokenAmount || 0}
      />
      <TransactionActiveModal open={!!transactionStatus} close={resetDeposit} />
    </article>
  );
};
export default MainPage;