describe MiqDecorator do
  context ".for" do
    it "returns nil when a class doesn't have a decorator" do
      class TestClassWithout1
      end

      expect(MiqDecorator.for(TestClassWithout1)).to eq(nil)
    end

    it "correctly decorates a class when a decorator exists" do
      class TestClass2
      end

      class TestClass2Decorator < MiqDecorator
      end

      expect(MiqDecorator.for(TestClass2)).to eq(TestClass2Decorator)
    end

    it "correctly decorates a namespaced class" do
      module TestModule3
        class TestClass3
        end

        class TestClass3Decorator < MiqDecorator
        end
      end

      expect(MiqDecorator.for(TestModule3::TestClass3)).to eq(TestModule3::TestClass3Decorator)
    end

    it "correctly doesn't decorate a namespaced class" do
      module TestModule4
        class TestClass4
        end
      end

      class TestClass4Decorator < MiqDecorator
      end

      expect(MiqDecorator.for(TestModule4::TestClass4)).not_to eq(TestClass4Decorator)
      expect(MiqDecorator.for(TestModule4::TestClass4)).to eq(nil)
    end

    it "correctly decorates a class when only a decorator for the superclass" do
      class TestParent5
      end

      class TestClass5 < TestParent5
      end

      class TestParent5Decorator < MiqDecorator
      end

      expect(MiqDecorator.for(TestClass5)).to eq(TestParent5Decorator)
    end

    it "correctly decorates an instance" do
      class TestClass6
        extend MiqDecorator::Klass
        include MiqDecorator::Instance

        attr_reader :x

        def initialize(x)
          @x = x
        end
      end

      class TestClass6Decorator < MiqDecorator
        def foo
          x + 1
        end
      end

      instance = TestClass6.new(123)

      expect(instance.decorate.foo).to eq(124)
    end
  end
end
