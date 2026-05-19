import { useState, useRef, useEffect, FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSelector } from '../../services/store';
import { getIngredientsState } from '../../services/slices/ingredientsSlice';
import { getConstructorItemsState } from '../../services/slices/constructorSlice';
import { TTabMode, TIngredient } from '@utils-types';
import { BurgerIngredientsUI } from '../ui/burger-ingredients';

export const BurgerIngredients: FC = () => {
  const ingredients = useSelector(getIngredientsState);
  const constructorItems = useSelector(getConstructorItemsState);

  const getIngredientCount = (ingredient: TIngredient) => {
    if (ingredient.type === 'bun') {
      return constructorItems.bun?._id === ingredient._id ? 2 : 0;
    }
    return constructorItems.ingredients.filter(
      (item) => item._id === ingredient._id
    ).length;
  };

  const buns = ingredients
    .filter((item) => item.type === 'bun')
    .map((item) => ({ ...item, count: getIngredientCount(item) }));

  const mains = ingredients
    .filter((item) => item.type === 'main')
    .map((item) => ({ ...item, count: getIngredientCount(item) }));

  const sauces = ingredients
    .filter((item) => item.type === 'sauce')
    .map((item) => ({ ...item, count: getIngredientCount(item) }));

  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');
  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);

  const [bunsRef, inViewBuns] = useInView({
    threshold: 0
  });

  const [mainsRef, inViewFilling] = useInView({
    threshold: 0
  });

  const [saucesRef, inViewSauces] = useInView({
    threshold: 0
  });

  useEffect(() => {
    if (inViewBuns) {
      setCurrentTab('bun');
    } else if (inViewSauces) {
      setCurrentTab('sauce');
    } else if (inViewFilling) {
      setCurrentTab('main');
    }
  }, [inViewBuns, inViewFilling, inViewSauces]);

  const onTabClick = (tab: string) => {
    setCurrentTab(tab as TTabMode);
    if (tab === 'bun')
      titleBunRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'main')
      titleMainRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'sauce')
      titleSaucesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={buns}
      mains={mains}
      sauces={sauces}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};
