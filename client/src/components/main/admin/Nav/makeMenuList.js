import _ from "lodash";
import React from "react";
import {
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  CloudUpload as CloudUploadIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  EventNote as EventNoteIcon,
  FindInPage as FindInPageIcon,
  LibraryBooks as LibraryBooksIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AccessibilityNew as AccessibilityNewIcon,
  DirectionsRun as DirectionsRunIcon,
  LocalHospital as LocalHospitalIcon
} from "@material-ui/icons";

export default ({ props }) => {
  function requireRoleMenuItem(menuItem) {
    const { role } = props;
    return role.includes("ADMIN") ? menuItem : null;
  }

  return _.chain([
    { icon: <DashboardIcon />, label: "Dashboard", link: "/dashboard" },
    requireRoleMenuItem({
      icon: <PeopleIcon />,
      label: "Users",
      link: "/users"
    }),
    {
      icon: <PersonIcon />,
      label: "My Profile",
      link: "/profile"
    },
    {
      icon: <ExitToAppIcon />,
      label: "Logout",
      link: "/signOut"
    }
  ])
    .compact()
    .value();
};
