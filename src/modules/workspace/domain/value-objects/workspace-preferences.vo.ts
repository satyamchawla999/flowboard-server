import { BaseValueObject } from '@common/base';

export enum TaskView {
  LIST = 'LIST',
  BOARD = 'BOARD',
  CALENDAR = 'CALENDAR',
}

interface WorkspacePreferencesProps {
  defaultTaskView: TaskView;
  defaultTimezone: string;
  notificationSettings?: string | null;
  automationRules?: string | null;
  customStatuses?: string | null;
}

export class WorkspacePreferences extends BaseValueObject<WorkspacePreferencesProps> {
  private constructor(props: WorkspacePreferencesProps) {
    super(props);
  }

  static create(props: Partial<WorkspacePreferencesProps> = {}): WorkspacePreferences {
    return new WorkspacePreferences({
      defaultTaskView: props.defaultTaskView ?? TaskView.BOARD,
      defaultTimezone: props.defaultTimezone ?? 'UTC',
      notificationSettings: props.notificationSettings ?? null,
      automationRules: props.automationRules ?? null,
      customStatuses: props.customStatuses ?? null,
    });
  }

  get defaultTaskView(): TaskView {
    return this.props.defaultTaskView;
  }

  get defaultTimezone(): string {
    return this.props.defaultTimezone;
  }

  get notificationSettings(): string | null {
    return this.props.notificationSettings ?? null;
  }

  get automationRules(): string | null {
    return this.props.automationRules ?? null;
  }

  get customStatuses(): string | null {
    return this.props.customStatuses ?? null;
  }

  update(props: Partial<WorkspacePreferencesProps>): WorkspacePreferences {
    return new WorkspacePreferences({
      defaultTaskView: props.defaultTaskView ?? this.props.defaultTaskView,
      defaultTimezone: props.defaultTimezone ?? this.props.defaultTimezone,
      notificationSettings:
        props.notificationSettings !== undefined
          ? props.notificationSettings
          : this.props.notificationSettings,
      automationRules:
        props.automationRules !== undefined ? props.automationRules : this.props.automationRules,
      customStatuses:
        props.customStatuses !== undefined ? props.customStatuses : this.props.customStatuses,
    });
  }
}
