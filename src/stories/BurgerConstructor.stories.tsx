import type { Meta, StoryObj, Decorator } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { BurgerConstructor } from '../components/burger-constructor/burger-constructor';
import store from '../services/store';

const burgerConstructorDecorator: Decorator = (Story) => (
  <Provider store={store}>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </Provider>
);

const meta: Meta<typeof BurgerConstructor> = {
  title: 'Components/BurgerConstructor',
  component: BurgerConstructor,
  decorators: [burgerConstructorDecorator]
};

export default meta;
type Story = StoryObj<typeof BurgerConstructor>;

export const Default: Story = {};
