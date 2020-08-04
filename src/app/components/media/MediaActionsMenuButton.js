import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import EditTitleAndDescriptionDialog from './EditTitleAndDescriptionDialog';
import RefreshMediaMenuItem from './RefreshMediaMenuItem';
import { can } from '../Can';

class MediaActionsMenuButton extends React.PureComponent {
  static propTypes = {
    projectMedia: PropTypes.shape({
      id: PropTypes.string.isRequired,
      permissions: PropTypes.string.isRequired,
      archived: PropTypes.bool.isRequired,
      last_status_obj: PropTypes.shape({
        locked: PropTypes.bool.isRequired,
      }).isRequired,
      media: PropTypes.shape({
        url: PropTypes.string,
      }).isRequired,
    }).isRequired,
    handleSendToTrash: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleAssign: PropTypes.func.isRequired,
    handleStatusLock: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
    isEditTitleAndDescriptionDialogOpen: false,
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleOpenEditTitleAndDescriptionDialog = () => {
    this.setState({ isEditTitleAndDescriptionDialogOpen: true, anchorEl: null });
  };

  handleCloseEditTitleAndDescriptionDialog = () => {
    this.setState({ isEditTitleAndDescriptionDialogOpen: false });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleActionAndClose = (callback) => {
    this.handleCloseMenu();
    if (callback) {
      callback();
    }
  };

  render() {
    const {
      projectMedia,
      handleSendToTrash,
      handleRestore,
      handleAssign,
      handleStatusLock,
    } = this.props;
    const {
      isEditTitleAndDescriptionDialogOpen,
    } = this.state;
    const menuItems = [];

    if (can(projectMedia.permissions, 'update ProjectMedia') && !projectMedia.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.edit"
          className="media-actions__edit"
          onClick={this.handleOpenEditTitleAndDescriptionDialog}
        >
          <FormattedMessage id="mediaActions.edit" defaultMessage="Edit title and description" />
        </MenuItem>));
    }

    if (
      can(projectMedia.permissions, 'update ProjectMedia')
      && !projectMedia.archived
      && projectMedia.media.url
    ) {
      menuItems.push(<RefreshMediaMenuItem projectMedia={projectMedia} />);
    }

    if (can(projectMedia.permissions, 'update Status') && !projectMedia.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.assign"
          className="media-actions__assign"
          onClick={() => this.handleActionAndClose(handleAssign)}
        >
          <FormattedMessage id="mediaActions.assignOrUnassign" defaultMessage="Assignment" />
        </MenuItem>));
    }

    if (can(projectMedia.permissions, 'lock Annotation') && !projectMedia.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.lockStatus"
          className="media-actions__lock-status"
          onClick={() => this.handleActionAndClose(handleStatusLock)}
        >
          {projectMedia.last_status_obj.locked
            ? <FormattedMessage id="mediaActions.unlockStatus" defaultMessage="Unlock status" />
            : <FormattedMessage id="mediaActions.lockStatus" defaultMessage="Lock status" />
          }
        </MenuItem>
      ));
    }

    if (can(projectMedia.permissions, 'update ProjectMedia') && !projectMedia.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.sendToTrash"
          className="media-actions__send-to-trash"
          onClick={() => this.handleActionAndClose(handleSendToTrash)}
        >
          <FormattedMessage id="mediaActions.sendToTrash" defaultMessage="Send to trash" />
        </MenuItem>
      ));
    }

    if (can(projectMedia.permissions, 'restore ProjectMedia') && projectMedia.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.restore"
          className="media-actions__restore"
          id="media-actions__restore"
          onClick={() => this.handleActionAndClose(handleRestore)}
        >
          <FormattedMessage id="mediaActions.restore" defaultMessage="Restore from trash" />
        </MenuItem>
      ));
    }

    return menuItems.length ? (
      <div>
        <IconButton
          tooltip={<FormattedMessage id="mediaActions.tooltip" defaultMessage="Item actions" />}
          onClick={this.handleOpenMenu}
        >
          <IconMoreVert className="media-actions__icon" />
        </IconButton>
        <Menu
          className="media-actions"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
        <EditTitleAndDescriptionDialog
          open={isEditTitleAndDescriptionDialogOpen}
          projectMedia={projectMedia}
          onClose={this.handleCloseEditTitleAndDescriptionDialog}
        />
      </div>
    ) : null;
  }
}

export default createFragmentContainer(MediaActionsMenuButton, {
  projectMedia: graphql`
    fragment MediaActionsMenuButton_projectMedia on ProjectMedia {
      id
      permissions
      archived
      media {
        url
      }
      last_status_obj {
        locked
      }
      ...EditTitleAndDescriptionDialog_projectMedia
      ...RefreshMediaMenuItem_projectMedia
    }
  `,
});
