import {getAndroidBackAction} from '../../../App';

describe('getAndroidBackAction', () => {
  const setCurrentScreen = jest.fn();
  const setReadOnlyProfileParams = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates from register to login', () => {
    const handled = getAndroidBackAction(
      'Register',
      setCurrentScreen,
      setReadOnlyProfileParams,
    );

    expect(handled).toBe(true);
    expect(setCurrentScreen).toHaveBeenCalledWith('Login');
  });

  it('navigates from read-only profile to conversation', () => {
    const handled = getAndroidBackAction(
      'ReadOnlyProfile',
      setCurrentScreen,
      setReadOnlyProfileParams,
    );

    expect(handled).toBe(true);
    expect(setReadOnlyProfileParams).toHaveBeenCalledWith(null);
    expect(setCurrentScreen).toHaveBeenCalledWith('Conversation');
  });

  it('navigates from conversation to matches', () => {
    const handled = getAndroidBackAction(
      'Conversation',
      setCurrentScreen,
      setReadOnlyProfileParams,
    );

    expect(handled).toBe(true);
    expect(setCurrentScreen).toHaveBeenCalledWith('Matches');
  });

  it('returns false when no back navigation is available', () => {
    const handled = getAndroidBackAction(
      'Matches',
      setCurrentScreen,
      setReadOnlyProfileParams,
    );

    expect(handled).toBe(false);
    expect(setCurrentScreen).not.toHaveBeenCalled();
    expect(setReadOnlyProfileParams).not.toHaveBeenCalled();
  });
});
