import _ from "lodash";
import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";

import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FiberManualRecord as FiberManualRecordIcon
} from "@material-ui/icons";

import * as navActions from "../../../../actions/nav";
import makeMenuList from "./makeMenuList";
import UPHLogo from "../../../../res/images/uph_medan_campus.jpeg";
import CleanLink from "../../../misc/CleanLink";

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.palette.background.paper
  }
});

class NestedList extends React.Component {
  handleLinkClick = () => {
    this.props.toggleDrawerOpen(false);
  };

  handleCollapseClick = stateName => {
    this.props.toggleCollapseActive(stateName);
  };

  renderMenuList = ({ menuList }) => {
    const { navState } = this.props;
    const makePadding = unit => ({ paddingLeft: `${unit * 1.5}em` });
    const renderMenu = (menu, path, depth) => {
      if (menu.link) {
        return (
          <CleanLink
            key={menu.label}
            to={menu.link}
            onClick={() => this.handleLinkClick()}
          >
            <ListItem
              button
              style={{
                ...makePadding(depth)
              }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText inset primary={menu.label} />
            </ListItem>
          </CleanLink>
        );
      } else if (menu.subMenus) {
        const stateName = `${path}/${menu.label}#${depth}`;
        return (
          <div key={menu.label}>
            <ListItem
              button
              onClick={() => this.handleCollapseClick(stateName)}
              style={makePadding(depth)}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText inset primary={menu.label} />
              {Boolean(navState[stateName]) ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </ListItem>

            <Collapse
              in={Boolean(navState[stateName])}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {menu.subMenus.map(subMenu =>
                  renderMenu(subMenu, `${path}/${menu.label}`, depth + 1)
                )}
              </List>
            </Collapse>
          </div>
        );
      }
    };
    return _.map(menuList, menu => renderMenu(menu, "", 1));
  };

  render() {
    const { email, connected, classes } = this.props;

    const subheader = (
      <div>
        <CleanLink to="/" onClick={this.closeDrawer}>
          <ListSubheader component="div" style={{ background: "white" }}>
            <img
              src={UPHLogo}
              alt="HRIS UPH Medan Campus"
              style={{ width: "100%", marginTop: "1em" }}
            />
          </ListSubheader>
        </CleanLink>
        <Typography
          variant="body2"
          style={{
            color: "black",
            margin: "1em",
            display: "flex",
            alignItems: "center"
          }}
        >
          <Tooltip title={connected ? "Online" : "Offline"} placement="top">
            <FiberManualRecordIcon
              style={{
                color: connected ? "limegreen" : "red",
                marginRight: "0.35em"
              }}
            />
          </Tooltip>{" "}
          {email}
        </Typography>
        <Divider />
      </div>
    );

    const menuList = makeMenuList({ props: this.props });

    return (
      <div className={classes.root}>
        <List component="nav" subheader={subheader}>
          {this.renderMenuList({ menuList })}
        </List>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth,
    ...state.nav
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...navActions }
  )
)(NestedList);
