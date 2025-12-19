import { motion } from "framer-motion";
import { Compass, Construction, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const GrifoWay = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card className="border-2 border-dashed border-secondary/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg"
            >
              <Compass className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              GrifoWay
              <Sparkles className="w-5 h-5 text-secondary" />
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Construction className="w-4 h-4" />
              <span className="text-sm font-medium">Em Desenvolvimento</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Uma nova funcionalidade está sendo preparada para você. 
              Em breve, você terá acesso a ferramentas exclusivas para 
              otimizar ainda mais a gestão das suas obras.
            </p>

            <motion.div
              className="mt-6 flex justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-secondary"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default GrifoWay;
