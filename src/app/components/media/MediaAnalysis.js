import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MediaRoute from '../../relay/MediaRoute';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import CreateAnalysisMutation from '../../relay/mutations/CreateAnalysisMutation';
import UpdateAnalysisMutation from '../../relay/mutations/UpdateAnalysisMutation';
import CheckContext from '../../CheckContext';
import { stringHelper } from '../../customHelpers';

class MediaAnalysisComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canSave: false,
      saving: false,
      value: null,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleSave() {
    const cachedMedia = this.props.cachedMedia || {};
    const media = Object.assign(cachedMedia, this.props.media);

    const onFailure = () => {
      const message = (<FormattedMessage
        id="mediaAnalysis.error"
        defaultMessage="Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists."
        values={{
          supportEmail: stringHelper('SUPPORT_EMAIL'),
        }}
      />);
      this.props.setFlashMessage(message);
      this.setState({ saving: false });
    };

    const onSuccess = () => {
      this.setState({ saving: false });
    };

    const fields = {
      analysis_text: this.state.value,
    };

    if (this.state.canSave) {
      if (media.dynamic_annotation_analysis) {
        Relay.Store.commitUpdate(
          new UpdateAnalysisMutation({
            parent_type: 'project_media',
            annotator: this.getContext().currentUser,
            annotated: media,
            annotation: {
              id: media.dynamic_annotation_analysis.id,
              fields,
              annotated_type: 'ProjectMedia',
              annotated_id: media.dbid,
            },
          }),
          { onFailure, onSuccess },
        );
      } else {
        Relay.Store.commitUpdate(
          new CreateAnalysisMutation({
            parent_type: 'project_media',
            annotator: this.getContext().currentUser,
            annotated: media,
            annotation: {
              fields,
              annotated_type: 'ProjectMedia',
              annotated_id: media.dbid,
            },
          }),
          { onFailure, onSuccess },
        );
      }
    }

    this.setState({ saving: true });
  }

  handleChange(event) {
    const newValue = event.target.value;
    this.props.setFlashMessage(null);
    const canSave = (newValue.trim().length > 0);
    this.setState({ value: newValue, canSave });
  }

  render() {
    const cachedMedia = this.props.cachedMedia || {};
    const media = Object.assign(cachedMedia, this.props.media);

    const disabled = (media.archived || !can(media.permissions, 'create Dynamic'));

    let value = null;
    if (media.dynamic_annotation_analysis) {
      value = JSON.parse(media.dynamic_annotation_analysis.content)[0].formatted_value;
    }

    return (
      <div>
        <div>
          <TextField
            label={
              <FormattedMessage
                id="mediaAnalysis.type"
                defaultMessage="Type an analysis of this item that will appear in the item's report..."
              />
            }
            defaultValue={value}
            disabled={disabled}
            onChange={this.handleChange.bind(this)}
            multiline
            fullWidth
            rows={10}
            margin="normal"
          />
        </div>
        { !disabled ?
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={this.state.saving || !this.state.canSave}
              onClick={this.handleSave.bind(this)}
            >
              <FormattedMessage
                id="mediaAnalysis.save"
                defaultMessage="Save"
              />
            </Button>
          </div> : null }
      </div>
    );
  }
}

MediaAnalysisComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

MediaAnalysisComponent.contextTypes = {
  store: PropTypes.object,
};

const MediaAnalysisContainer = Relay.createContainer(withSetFlashMessage(MediaAnalysisComponent), {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        dynamic_annotation_analysis: annotation(annotation_type: "analysis") {
          id
          dbid
          content
        }
      }
    `,
  },
});

const MediaAnalysis = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });
  const cachedMedia = Object.assign({}, props.media);

  return (
    <Relay.RootContainer
      Component={MediaAnalysisContainer}
      renderFetched={data =>
        <MediaAnalysisContainer cachedMedia={cachedMedia} {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaAnalysis;
