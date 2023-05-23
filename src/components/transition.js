import { motion, AnimatePresence } from 'framer-motion';
import {useRouter} from "next/router";

const Transition = ({ children }) => {
    const { asPath } = useRouter();

    const variants = {
        out: {
                opacity: 0,
                transition: {
                    duration: 0.1
                }
            },
        in: {
            opacity: 1,
            transition: {
                duration: 0.1,
            }
        }
    };

    return (
      <div className={'transition-wrapper'}>
          <AnimatePresence
            initial={false}
          >
                <motion.div
                    key={asPath}
                    variants={variants}
                    animate="in"
                    initial="out"
                    exit="out"
                >
                    {children}
                </motion.div>
          </AnimatePresence>
      </div>
    )
};

export default Transition;
