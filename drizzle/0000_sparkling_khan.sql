CREATE TABLE "Payout" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"note" varchar(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"shiftId" integer NOT NULL,
	"workerId" integer
);
--> statement-breakpoint
CREATE TABLE "ProductSale" (
	"id" serial PRIMARY KEY NOT NULL,
	"product" varchar(255) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"shiftId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ServiceEntry" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" varchar(255) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"shiftId" integer NOT NULL,
	"workerId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Shift" (
	"id" serial PRIMARY KEY NOT NULL,
	"shiftDate" timestamp NOT NULL,
	"openingCash" numeric(12, 2) DEFAULT 0 NOT NULL,
	"closingCash" numeric(12, 2),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"adminId" integer
);
--> statement-breakpoint
CREATE TABLE "Tip" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"shiftId" integer NOT NULL,
	"workerId" integer NOT NULL,
	CONSTRAINT "Tip_shiftId_workerId_unique" UNIQUE("shiftId","workerId")
);
--> statement-breakpoint
CREATE TABLE "Worker" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(32) NOT NULL,
	"category" varchar(255),
	"active" boolean DEFAULT true NOT NULL,
	"salaryRate" numeric(6, 3) DEFAULT 0.5 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_shiftId_Shift_id_fk" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_workerId_Worker_id_fk" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_shiftId_Shift_id_fk" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServiceEntry" ADD CONSTRAINT "ServiceEntry_shiftId_Shift_id_fk" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServiceEntry" ADD CONSTRAINT "ServiceEntry_workerId_Worker_id_fk" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_adminId_Worker_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."Worker"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_shiftId_Shift_id_fk" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_workerId_Worker_id_fk" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payouts_shift" ON "Payout" USING btree ("shiftId");--> statement-breakpoint
CREATE INDEX "idx_product_sales_shift" ON "ProductSale" USING btree ("shiftId");--> statement-breakpoint
CREATE INDEX "idx_service_entries_shift" ON "ServiceEntry" USING btree ("shiftId");--> statement-breakpoint
CREATE INDEX "idx_service_entries_worker" ON "ServiceEntry" USING btree ("workerId");--> statement-breakpoint
CREATE INDEX "idx_tips_shift" ON "Tip" USING btree ("shiftId");