import _ from "lodash";
import React from "react";
import {
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  LocalOffer as LocalOfferIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  Done as DoneIcon
} from "@material-ui/icons";

export default ({ props }) => {
  const requireRoleMenuItem = requiredRole => menuItem => {
    const { role } = props;
    return role === requiredRole ? menuItem : null;
  };

  return _.chain([
    { icon: <DashboardIcon />, label: "Dashboard", link: "/admin/dashboard" },
    {
      icon: <PeopleIcon />,
      label: "Candidates",
      link: "/admin/candidates"
    },
    {
      icon: <LocalOfferIcon />,
      label: "Vote Tokens",
      link: "/admin/voteTokens"
    },
    {
      icon: <InfoIcon />,
      label: "Result",
      subMenus: [
        {
          icon: <DoneIcon />,
          label: "Display Result",
          link: "/result",
          target: "_blank"
        },
        {
          icon: <BarChartIcon />,
          label: "Chart",
          link: "/admin/chart"
        }
      ]
    },
    requireRoleMenuItem("SUPER_ADMIN")({
      icon: <PeopleIcon />,
      label: "Users",
      link: "/admin/users"
    }),
    {
      icon: <PersonIcon />,
      label: "My Profile",
      link: "/admin/profile"
    },
    {
      icon: <ExitToAppIcon />,
      label: "Logout",
      link: "/admin/signOut"
    }
  ])
    .compact()
    .value();
};
