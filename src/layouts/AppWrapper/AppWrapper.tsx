// import {
//   // NavLink,
//   // Typography,
//   useHistory,
//   useLocation,
// } from "@chainsafe/common-components";
import React, { useEffect, useState } from "react";
import { ReactNode } from "react";

import {
  Switch,
  NavLink,
  Link,
  useLocation,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
// import Link from '@mui/material/Link';
import Typography from "@mui/material/Typography";

import AppHeader from "../AppHeader/AppHeader";
import { ReactComponent as GlobalSvg } from "../../media/Icons/global.svg";
import { ReactComponent as GiftSvg } from "../../media/Icons/gift.svg";
import { ROUTE_LINKS } from "../../routes";
import { useStyles } from "./styles";

interface IAppWrapper {
  children: ReactNode | ReactNode[];
  wrapTokenPage?: boolean;
}

const AppWrapper: React.FC<IAppWrapper> = ({
  children,
  wrapTokenPage,
}: IAppWrapper) => {
  const classes = useStyles();
  const [enableNavTabs, setEnableNavTabs] = useState(true);

  const location = useLocation();
  const history = useHistory();

  const { __RUNTIME_CONFIG__ } = window;

  const indexerEnabled = "INDEXER_URL" in __RUNTIME_CONFIG__;

  useEffect(() => {
    if (location.pathname.includes("/explorer") && !indexerEnabled) {
      history.push("/transfer");
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes("/explorer")) {
      return setEnableNavTabs(false);
    }
    return setEnableNavTabs(true);
  }, [location]);

  const routeMatch = useRouteMatch([ROUTE_LINKS.Transfer, ROUTE_LINKS.Wrap]);
  const currentTab = routeMatch?.path;

  return (
    <div className={classes.root}>
      {enableNavTabs ? (
        <div className={classes.inner}>
          <AppHeader />
          <div className={classes.content}>
            {enableNavTabs && (
              <Tabs value={currentTab}>
                <Tab
                  icon={<GlobalSvg />}
                  iconPosition="start"
                  label="Transfer"
                  value={ROUTE_LINKS.Transfer}
                  to={ROUTE_LINKS.Transfer}
                  component={Link}
                />
                {wrapTokenPage && (
                  <Tab
                    icon={<GiftSvg />}
                    iconPosition="start"
                    label="Wrap"
                    value={ROUTE_LINKS.Wrap}
                    to={ROUTE_LINKS.Wrap}
                    component={Link}
                  />
                )}
              </Tabs>
            )}
            <div className={classes.pageArea}>{children}</div>
          </div>

          {/* Put CTA here */}
          {/* <a className={classes.cta} rel="noopener noreferrer" target="_blank" href="#">
        </a> */}
        </div>
      ) : (
        <div className={classes.explorerMainContent}>
          <AppHeader />
          <div className={classes.explorerArea}>{children}</div>
        </div>
      )}
    </div>
  );
};

export default AppWrapper;
