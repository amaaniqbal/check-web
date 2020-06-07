import Relay from 'react-relay/classic';

class UpdateReportDesignMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {
      updateDynamicAnnotationReportDesign
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateDynamicAnnotationReportDesignPayload {
      dynamicEdge,
      project_media {
        dynamic_annotation_report_design: annotation(annotation_type: "report_design")
      }
    }`;
  }

  getFiles() {
    if (this.props.image) {
      return { 'file[]': this.props.image };
    }
    return {};
  }

  getVariables() {
    const dynamic = this.props.annotation;
    return {
      id: this.props.id,
      set_fields: JSON.stringify(dynamic.fields),
      annotation_type: dynamic.annotation_type,
      annotated_id: `${dynamic.annotated_id}`,
      annotated_type: dynamic.annotated_type,
      action: dynamic.action,
    };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default UpdateReportDesignMutation;
