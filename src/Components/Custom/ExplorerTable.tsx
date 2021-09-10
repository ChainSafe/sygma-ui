import React from "react";
import { makeStyles, createStyles, ITheme } from "@chainsafe/common-theme";
import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  TableHeadCell,
  SvgIcon,
  Button,
  Avatar,
  Blockies,
} from "@chainsafe/common-components";
import { DepositRecord } from "../../Contexts/Reducers/TransfersReducer";
import {
  formatAmount,
  formatTransferDate,
  getIcon,
  getRandomSeed,
  getTokenIcon,
  shortenAddress,
} from "../../Utils/Helpers";
import { ReactComponent as DirectionalIcon } from "../../media/Icons/directional.svg";
import DetailView from "./DetailView";

type PillColorSchema = {
  pillColorSchema: {
    borderColor: string;
    background: string;
  };
};

const useStyles = makeStyles(({ breakpoints }: ITheme) =>
  createStyles({
    root: {
      display: "table",
      width: "100%",
      "& > thead > tr": {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    row: {
      fontWeight: 400,
      verticalAlign: "middle",
      "& > td:nth-child(1)": {
        paddingLeft: 26,
        textAlign: "left",
      },
      "& > td": {
        textAlign: "left",
        "& > div": {
          display: "flex",
          "& > span:nth-child(1)": {
            marginRight: 3,
          },
          "& > span": {
            display: "flex",
            alignItems: "center",
            "& > span": {
              marginLeft: 2,
            },
          },
        },
        "& > div > span > svg": {
          height: 21,
          width: 21,
        },
        "& > div > span > svg:last-child": {
          height: "14.44px",
          width: "14.44px",
        },
      },
    },
    elipsisIcon: {
      borderRadius: "50%",
    },
    accountAddress: {
      display: "flex",
    },
    addressDetailView: {
      display: "flex",
      marginTop: 10,
    },
    cellRow: {
      verticalAlign: "middle",
    },
    tokenIcon: {
      height: 14,
      width: 14,
    },
    amountInfo: {
      display: "flex",
      alignItems: "center",
    },
    viewDetailsInfo: {
      "& > button": {
        background: "none",
        color: "black",
        border: "none",
        padding: "0 !important",
        textDecoration: "underline",
      },
    },
    avatar: {
      marginRight: 6,
    },
    transferDetailContainer: {
      width: "100%",
      "& > section": {
        maxWidth: "768px !important",
        width: "100%",
        [breakpoints.down("sm")]: {
          width: "411px !important",
        },
      },
    },
    transferDetails: {
      minWidth: 768,
      width: "100%",
      height: 731,
      [breakpoints.down("sm")]: {
        minWidth: 411,
      },
    },
    closeButton: {
      display: "flex",
      justifyContent: "flex-end",
      "& > button": {
        background: "none",
        border: "none",
        "& > span": {
          width: 15,
          height: 15,
        },
        "& > span > span": {
          width: 15,
          height: 15,
        },
        "& > span > span > svg": {
          fill: "#9E9E9E",
          border: "#9E9E9E",
          width: 15,
          height: 15,
          // transitionDuration: "unset",
        },
      },
    },
    transferDetailSection: {
      width: "100%",
      padding: "0px 38px 0px 38px",
      "& > hr": {
        color: "#595959",
        marginTop: 26,
      },
    },
    headerSection: {
      display: "flex",
      flexDirection: "column",
      marginBottom: 26,
      "& > span": {
        marginBottom: 8,
        fontSize: 14,
      },
    },
    statusSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      marginBottom: 26,
      [breakpoints.down("sm")]: {
        "& > div:nth-child(2)": {
          gridColumn: "3/3",
        },
      },
    },
    sentAndFromSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      marginBottom: 26,
    },
    colTitles: {
      color: "#595959",
    },
    amountSent: {
      fontSize: 16,
      "& > div": {
        marginTop: 16,
      },
      "& > p": {
        marginTop: 10,
        fontsize: 16,
      },
      [breakpoints.down("sm")]: {
        gridColumn: "span 3",
        marginBottom: 16,
      },
    },
    toDetailView: {
      [breakpoints.down("sm")]: {
        gridColumn: "3/3",
      },
      "& > div": {
        marginTop: 12,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        "& > span:nth-child(2)": {
          marginLeft: 6,
          fontSize: 16,
        },
      },
    },
    fromDetailView: {
      "& > div": {
        marginTop: 12,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        "& > span": {
          marginLeft: 6,
          fontSize: 16,
        },
      },
    },
    proposalStatusPill: {
      display: "flex",
      justifyContent: "center",
      borderRadius: 16,
      background: ({ pillColorSchema }: PillColorSchema) =>
        pillColorSchema.background,
      border: ({ pillColorSchema }: PillColorSchema) =>
        `1px solid ${pillColorSchema.borderColor}`,
      width: 75,
      height: 22,
      fontSize: 14,
      padding: "0px 8px 0px 8px",
      margin: "10px 0px",
      color: ({ pillColorSchema }: PillColorSchema) =>
        pillColorSchema.borderColor,
      fontWeight: 400,
    },
    fromAddressDetails: {
      fontSize: 16,
    },
    bridgeSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
    },
    transactionHashSection: {
      gridColumn: "1/3",
      "& > div": {
        display: "flex",
        flexDirection: "column",
        "& > span:nth-child(2)": {
          marginTop: 12,
          fontSize: 14,
          display: "flex",
        },
      },
    },
    transferTimeline: {},
  })
);

// TODO: just for mocking purposes
type ExplorerTable = {
  transactionList: DepositRecord[];
  handleOpenModal: (fromAddress: string | undefined) => () => void;
  handleClose: () => void;
  active: boolean;
  setActive: (state: boolean) => void;
  transferDetails: DepositRecord | undefined;
  pillColorStatus: { borderColor: string; background: string };
};

const ExplorerTable: React.FC<ExplorerTable> = ({
  transactionList,
  active,
  setActive,
  handleOpenModal,
  handleClose,
  transferDetails,
  pillColorStatus,
}: ExplorerTable) => {
  const classes = useStyles({
    pillColorSchema: pillColorStatus,
  });

  const renderTransferList = (transferData: DepositRecord[]) =>
    transferData.map((transfer: DepositRecord, idx: number) => {
      const fromAddressShortened = shortenAddress(transfer.fromAddress ?? "");

      const FromChainIcon = getIcon(transfer.fromChainId);
      const ToChainIcon = getIcon(transfer.toChainId);
      const TokenIcon = getTokenIcon();

      const randomString = getRandomSeed();

      const transferDateFormated = formatTransferDate(transfer.timestamp);

      const amount = transfer.amount?.toNumber();
      const formatedAmount = formatAmount(amount);

      return (
        <TableRow className={classes.row} key={transfer.fromAddress}>
          <TableCell className={classes.cellRow}>
            {transferDateFormated}
          </TableCell>
          <TableCell>
            <div className={classes.accountAddress}>
              <Avatar size="small" className={classes.avatar}>
                <Blockies
                  seed={randomString}
                  size={15}
                  color={"pink"}
                  bgColor={"white"}
                />
              </Avatar>
              <span>{fromAddressShortened}</span>
            </div>
          </TableCell>
          <TableCell className={classes.row}>
            <div>
              <span>
                <SvgIcon>
                  <FromChainIcon />
                </SvgIcon>
                <span>{transfer.fromNetworkName} to</span>
              </span>
              <span>
                <SvgIcon>
                  <ToChainIcon />
                </SvgIcon>{" "}
                <span>{transfer.toNetworkName}</span>
              </span>
            </div>
          </TableCell>
          <TableCell className={classes.row}>
            <span className={classes.amountInfo}>
              <SvgIcon>
                <TokenIcon className={classes.tokenIcon} />
              </SvgIcon>
              <span>{formatedAmount} ETH</span>
            </span>
          </TableCell>
          <TableCell className={classes.row}>
            <div className={classes.viewDetailsInfo}>
              <SvgIcon>
                <DirectionalIcon />
              </SvgIcon>
              <Button onClick={handleOpenModal(transfer.fromAddress)}>
                View Details
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });

  return (
    <Table fullWidth={true} className={classes.root}>
      <TableHead>
        <TableRow className={classes.row}>
          <TableHeadCell>Date</TableHeadCell>
          <TableHeadCell>From</TableHeadCell>
          <TableHeadCell>Transfer</TableHeadCell>
          <TableHeadCell>Value</TableHeadCell>
          <TableHeadCell></TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>{renderTransferList(transactionList)}</TableBody>
      <>
        <DetailView
          active={active}
          transferDetails={transferDetails}
          handleClose={handleClose}
          classes={classes}
        />
      </>
    </Table>
  );
};

export default ExplorerTable;